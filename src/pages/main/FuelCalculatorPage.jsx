import React, { useState, useMemo, useEffect } from 'react';
import { motorcycleModels } from '../../data/motorcycles';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';

// --- Helpers ---
const milesToKm = (m) => m * 1.60934;
const toLitersPer100km = (v, unit) => {
  if (!v || v <= 0) return 0;
  switch (unit) {
    case 'L/100km': return v;
    case 'km/L': return 100 / v;
    case 'mpg': return 235.214583 / v; 
    default: return 0;
  }
};

const initialState = {
  distance: '',
  distanceUnit: 'km',
  efficiency: '',
  efficiencyUnit: 'km/L',
  fuelType: 'Gasoline / Unleaded (91)',
  fuelPrice: '56',
  currency: 'PHP',
  manualFuelAmount: '',
  useManualFuel: false,
  lastCalculated: null,
};
const currencySymbols = { PHP: '₱', USD: '$' };

const badge = 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-medium mr-2 shadow';
const sectionCard = 'rounded-lg border border-gray-700/70 bg-gray-800/60 backdrop-blur px-5 sm:px-6 py-5 flex flex-col gap-3 w-full';
const labelCls = 'text-sm font-medium flex items-center gap-2';
const inputBase = 'w-full rounded-md bg-gray-900/40 border border-gray-700 focus:border-indigo-500 focus:ring-0 outline-none px-3 py-2 text-sm placeholder-gray-500 transition';
const selectBase = 'rounded-md bg-gray-900/40 border border-gray-700 focus:border-indigo-500 outline-none px-2 py-2 text-sm';

const mpgToKmL = (mpg) => mpg * 0.425143707; // US mpg to km/L

const FuelCalculatorPage = () => {
  const [form, setForm] = useState(initialState);
  const [results, setResults] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [attempted, setAttempted] = useState(false);
  // Vehicle lookup state
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]); // {id,label,combMpg,year,make,model}
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [includeMotorcycles, setIncludeMotorcycles] = useState(false);

  const pristine = useMemo(() => JSON.stringify(form) === JSON.stringify(initialState) && !results, [form, results]);
  const symbol = currencySymbols[form.currency] || '';

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Vehicle search effect (debounced)
  useEffect(() => {
    const q = vehicleQuery.trim();
    if (q.length < 2) {
      setVehicleOptions(includeMotorcycles && q.length ? filterMotorcycles(q) : []);
      setVehicleError('');
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setVehicleLoading(true);
        setVehicleError('');
        const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        let url;
        if (tokens.length >= 2) {
          const makeTk = tokens[0];
          const modelTk = tokens.slice(1).join(' ');
          // where with ILIKE for make & model; fallback to search if fails
          const where = encodeURIComponent(`lower(make) LIKE '%${makeTk}%' AND lower(model) LIKE '%${modelTk}%'`);
          url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=60&where=${where}`;
        } else {
          url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records?limit=60&search=${encodeURIComponent(q)}`;
        }
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Network');
        const data = await res.json();
        const raw = (data.results || []).map(r => {
          const make = (r.make || r.make_display || '').trim();
          const model = (r.model || r.basemodel || '').trim();
          const year = r.year || r.year_from || r.year_to || '';
          const comb = r.comb08 || r.fe_combined || r.fe_comb || r.comb_fe || null;
          const city = r.city08 || null;
          const hwy = r.highway08 || null;
          let mpg = comb;
          if (!mpg && city && hwy) mpg = (city * 0.55 + hwy * 0.45).toFixed(1);
          if (!mpg) return null;
          const label = `${year || 'Year?'} ${make} ${model}`.replace(/\s+/g,' ').trim();
          const score = scoreVehicle(label, tokens, year);
          return { id: r.id || `${make}-${model}-${year}`, label, combMpg: mpg, year, make, model, score };
        }).filter(Boolean);

        const dedup = new Map();
        raw.forEach(v => {
          const key = v.label.toLowerCase();
            if (!dedup.has(key) || dedup.get(key).score < v.score) dedup.set(key, v);
        });
        let list = Array.from(dedup.values()).sort((a,b) => b.score - a.score).slice(0, 25);

        if (includeMotorcycles) {
          const motos = filterMotorcycles(q).map(m => ({
            id: 'moto-' + m.id,
            label: `${m.year} ${m.make} ${m.model} (Moto)` ,
            combMpg: (m.kmPerLiter / 0.425143707).toFixed(1), // convert km/L to mpg for internal uniformity
            year: m.year,
            make: m.make,
            model: m.model,
            score: 200 // boost to surface clearly when requested
          }));
          list = [...motos, ...list];
        }
        setVehicleOptions(list);
      } catch (e) {
        if (e.name !== 'AbortError') setVehicleError('Failed to load vehicles');
      } finally {
        setVehicleLoading(false);
      }
    }, 400);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [vehicleQuery, includeMotorcycles]);

  const scoreVehicle = (label, tokens, year) => {
    const l = label.toLowerCase();
    let score = 0;
    tokens.forEach(t => { if (l.includes(t)) score += 10; if (l.startsWith(t)) score += 5; });
    if (/\b\d{4}\b/.test(String(year))) score += Math.min( (parseInt(year,10)-1990), 30 );
    return score;
  };

  const filterMotorcycles = (q) => {
    const tks = q.toLowerCase().split(/\s+/).filter(Boolean);
    return motorcycleModels.filter(m => tks.every(t => `${m.make} ${m.model}`.toLowerCase().includes(t)));
  };

  const applyVehicle = (veh) => {
    setSelectedVehicle(veh);
    if (veh && veh.combMpg) {
      const kmL = mpgToKmL(parseFloat(veh.combMpg));
      setForm(f => ({ ...f, efficiencyUnit: 'km/L', efficiency: kmL ? kmL.toFixed(2) : f.efficiency }));
    }
  };

  const canCalculate = useMemo(() => {
    if (form.useManualFuel) return form.manualFuelAmount && form.fuelPrice;
    return form.distance && form.efficiency && form.fuelPrice;
  }, [form]);

  const performCalculation = () => {
    setAttempted(true);
    if (!canCalculate) return;
    const dVal = parseFloat(form.distance);
    const eVal = parseFloat(form.efficiency);
    const price = parseFloat(form.fuelPrice);
    let distanceKm = form.distanceUnit === 'km' ? dVal : milesToKm(dVal || 0);
    if (!form.useManualFuel && (!dVal || !eVal || !price)) return; // guard
    let litersNeeded = 0;
    if (form.useManualFuel) {
      litersNeeded = parseFloat(form.manualFuelAmount) || 0;
    } else {
      const l100 = toLitersPer100km(eVal, form.efficiencyUnit);
      litersNeeded = (distanceKm / 100) * l100;
    }
    const cost = litersNeeded * (price || 0);
    setResults({ litersNeeded, cost, currency: form.currency, timestamp: new Date().toISOString() });
    setForm((f) => ({ ...f, lastCalculated: Date.now() }));
  };
  const clearAll = () => { setForm(initialState); setResults(null); setAttempted(false); };
  const reloadCalculator = () => { clearAll(); setReloadKey(k => k + 1); };

  // Validation hints
  const showErrors = attempted && !canCalculate;
  const distanceMissing = !form.useManualFuel && !form.distance;
  const efficiencyMissing = !form.useManualFuel && !form.efficiency;
  const priceMissing = !form.fuelPrice;
  const manualMissing = form.useManualFuel && !form.manualFuelAmount;

  return (
    <div key={reloadKey} className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden pb-12">
      <SidePanel />
      <Header />
      <div className="pt-20 pl-0 md:pl-64 w-full">
        <div className="px-5 xs:px-6 sm:px-8 max-w-5xl mx-auto w-full">
          {/* Header full width */}
          <header className="max-w-3xl mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Fuel Calculator</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-prose">Follow the numbered steps, then press Calculate.</p>
          </header>
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Left column: steps */}
            <div className="flex-1 space-y-6 xl:pr-4 max-w-2xl w-full mx-auto">

              {/* Step 1: Vehicle Selection */}
              <section className={sectionCard} aria-labelledby="stepVehicle">
                <h2 id="stepVehicle" className="text-lg font-semibold flex items-center"><span className={badge}>1</span>Vehicle (Optional)</h2>
                <p className="text-xs text-gray-500 -mt-1">Select or search to auto-fill efficiency; you can still edit manually.</p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={vehicleQuery}
                      onChange={e => setVehicleQuery(e.target.value)}
                      placeholder="Search make / model (e.g. Toyota Camry)"
                      className={inputBase + ' flex-1'}
                    />
                    <button
                      type="button"
                      onClick={() => { setVehicleQuery(''); setVehicleOptions([]); setSelectedVehicle(null); }}
                      className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-xs font-medium"
                    >Clear</button>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-gray-400 select-none">
                    <input type="checkbox" className="accent-indigo-500" checked={includeMotorcycles} onChange={e => setIncludeMotorcycles(e.target.checked)} />
                    Include popular PH motorcycles
                  </label>
                  {vehicleLoading && <p className="text-xs text-indigo-400">Loading vehicles...</p>}
                  {vehicleError && <p className="text-xs text-rose-400">{vehicleError}</p>}
                  {!vehicleLoading && !vehicleError && vehicleOptions.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-md border border-gray-700 bg-gray-900/50 divide-y divide-gray-700 text-sm">
                      {vehicleOptions.map(o => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => applyVehicle(o)}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-700/60 transition flex flex-col ${selectedVehicle?.id === o.id ? 'bg-gray-700/70' : ''}`}
                        >
                          <span className="font-medium text-gray-200">{o.label}</span>
                          <span className="text-[11px] text-gray-400">Combined: {o.combMpg} mpg ≈ {mpgToKmL(o.combMpg).toFixed(2)} km/L</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {vehicleQuery && !vehicleLoading && vehicleOptions.length === 0 && !vehicleError && (
                    <p className="text-xs text-gray-500">No matches with fuel data.</p>
                  )}
                  {selectedVehicle && (
                    <p className="text-xs text-teal-400">Applied {selectedVehicle.label}. You may adjust efficiency below.</p>
                  )}
                </div>
              </section>

              {/* Step 2: Trip & Efficiency */}
              <section className={sectionCard} aria-labelledby="step1">
                <h2 id="step1" className="text-lg font-semibold flex items-center"><span className={badge}>2</span>Trip Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Distance {showErrors && distanceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="1" disabled={form.useManualFuel} value={form.distance} onChange={handleChange('distance')} placeholder="150" className={inputBase + (distanceMissing && showErrors ? ' border-rose-500' : '')} />
                      <select disabled={form.useManualFuel} value={form.distanceUnit} onChange={handleChange('distanceUnit')} className={selectBase}>
                        <option value="km">km</option><option value="miles">miles</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">One-way distance.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Efficiency {showErrors && efficiencyMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="1" disabled={form.useManualFuel} value={form.efficiency} onChange={handleChange('efficiency')} placeholder={form.efficiencyUnit === 'L/100km' ? '7.5' : form.efficiencyUnit === 'km/L' ? '40' : '30'} className={inputBase + (efficiencyMissing && showErrors ? ' border-rose-500' : '')} />
                      <select disabled={form.useManualFuel} value={form.efficiencyUnit} onChange={handleChange('efficiencyUnit')} className={selectBase}>
                        <option value="L/100km">L/100km</option><option value="km/L">km/L</option><option value="mpg">mpg (US)</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">Average consumption.</p>
                  </div>
                </div>
                {form.useManualFuel && <p className="text-xs text-amber-400">Manual fuel enabled: distance & efficiency ignored.</p>}
              </section>

              {/* Step 3: Price */}
              <section className={sectionCard} aria-labelledby="step2">
                <h2 id="step2" className="text-lg font-semibold flex items-center"><span className={badge}>3</span>Fuel Type & Price</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 max-w-sm">
                    <label className={labelCls}>Fuel Type</label>
                    <select value={form.fuelType} onChange={handleChange('fuelType')} className={selectBase + ' w-full'}>
                      <option>Gasoline / Unleaded (91)</option>
                      <option>Premium Gasoline (95 / 97 / 98)</option>
                      <option>Diesel</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Price per Liter {showErrors && priceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2 max-w-sm">
                      <input type="number" min="0" step="1" value={form.fuelPrice} onChange={handleChange('fuelPrice')} placeholder="56" className={inputBase + (priceMissing && showErrors ? ' border-rose-500' : '')} />
                      <select value={form.currency} onChange={handleChange('currency')} className={selectBase}>
                        {Object.keys(currencySymbols).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">Prices vary by station; enter your actual price for accuracy.</p>
                  </div>
                </div>
              </section>

              {/* Step 4: Optional override */}
              <section className={sectionCard} aria-labelledby="step3">
                <h2 id="step3" className="text-lg font-semibold flex items-center"><span className={badge}>4</span>Optional Override</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-indigo-500" checked={form.useManualFuel} onChange={handleChange('useManualFuel')} />
                  Enter fuel amount directly (liters)
                </label>
                <div className="flex gap-3 max-w-xs">
                  <input type="number" min="0" step="1" disabled={!form.useManualFuel} value={form.manualFuelAmount} onChange={handleChange('manualFuelAmount')} placeholder="35" className={inputBase + (!form.useManualFuel ? ' opacity-50 cursor-not-allowed' : '') + (manualMissing && showErrors ? ' border-rose-500' : '')} />
                  <div className="px-3 py-2 text-sm rounded-md bg-gray-900/40 border border-gray-700 select-none">L</div>
                </div>
                <p className="text-xs text-gray-500">Use if you already know the exact liters needed (e.g. from a previous trip).</p>
                {showErrors && manualMissing && <p className="text-xs text-rose-400">Enter a fuel amount or disable manual mode.</p>}
              </section>
            </div>

            {/* Right column: combined actions + results + tips */}
            <aside className="xl:w-[25rem] w-full flex-shrink-0 xl:sticky xl:top-24 mt-0 sm:mt-2 xl:mt-0">
              <div className={sectionCard + ' border-indigo-700/40 space-y-5'}>
                <h2 className="text-lg font-semibold flex items-center"><span className="text-indigo-400 mr-2">Result</span>Summary & Actions</h2>
                {/* Actions inline */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={performCalculation} disabled={!canCalculate} className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium shadow">Calculate</button>
                  <button onClick={clearAll} disabled={pristine} className="px-5 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium">Clear</button>
                  <button onClick={reloadCalculator} className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm font-medium">Reload</button>
                </div>
                {!canCalculate && <p className="text-xs text-amber-400 -mt-2">Fill required fields on the left.</p>}
                {/* Results */}
                <div className="space-y-4">
                  {results ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Fuel Needed</p>
                        <p className="text-2xl font-semibold mt-1">{results.litersNeeded.toFixed(2)} <span className="text-sm font-normal text-gray-400">L</span></p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Estimated Cost</p>
                        <p className="text-2xl font-semibold mt-1">{symbol}{results.cost.toFixed(2)} <span className="text-sm font-normal text-gray-400">{results.currency}</span></p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] text-gray-500">Calculated at {new Date(results.timestamp).toLocaleTimeString()}.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Enter inputs then press Calculate to see results.</p>
                  )}
                </div>
                {/* Tips condensed */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center"><span className="text-indigo-400 mr-1">ℹ</span>Quick Tips</h3>
                  <ul className="text-xs list-disc pl-5 space-y-1 text-gray-400">
                    <li>Steps on left → Calculate here.</li>
                    <li>Toggle manual liters if you know exact amount.</li>
                    <li>Driving style & conditions change efficiency.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelCalculatorPage;
