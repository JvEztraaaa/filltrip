import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addTrip } from '../../services/trips';
import { motorcycleModelsPH, carModelsPH } from '../../data/fuelEfficiency';
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
  fuelPrice: '',
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
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [attempted, setAttempted] = useState(false);
  // Vehicle lookup state
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [includeMotorcycles, setIncludeMotorcycles] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const lastAppliedQueryRef = useRef('');
  const [showFuelTypeDropdown, setShowFuelTypeDropdown] = useState(false);
  const fuelTypeRef = useRef(null);
  // Unified custom dropdown handling for units & currency
  const [openDropdown, setOpenDropdown] = useState(null); // 'distanceUnit' | 'efficiencyUnit' | 'currency'
  const distanceUnitRef = useRef(null);
  const efficiencyUnitRef = useRef(null);
  const currencyRef = useRef(null);
  const distanceInputRef = useRef(null);

  const pristine = useMemo(() => JSON.stringify(form) === JSON.stringify(initialState) && !results, [form, results]);
  const symbol = currencySymbols[form.currency] || '';

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  useEffect(() => {
    const onClick = (e) => {
      const targets = [
        { ref: fuelTypeRef, close: () => setShowFuelTypeDropdown(false) },
        { ref: distanceUnitRef, close: () => openDropdown === 'distanceUnit' && setOpenDropdown(null) },
        { ref: efficiencyUnitRef, close: () => openDropdown === 'efficiencyUnit' && setOpenDropdown(null) },
        { ref: currencyRef, close: () => openDropdown === 'currency' && setOpenDropdown(null) },
      ];
      targets.forEach(t => { if (t.ref.current && !t.ref.current.contains(e.target)) t.close(); });
    };
    if (showFuelTypeDropdown || openDropdown) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showFuelTypeDropdown, openDropdown]);

  // Prefill distance if coming from MapPage route state
  useEffect(() => {
    const state = location.state;
    if (state && typeof state.distanceKm === 'number' && !isNaN(state.distanceKm)) {
      setForm(f => ({ ...f, distance: state.distanceKm.toString(), distanceUnit: 'km' }));
      setTimeout(() => {
        distanceInputRef.current?.focus();
        distanceInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, []);

  // Local dataset + remote fallback search
  useEffect(() => {
    const qRaw = vehicleQuery.trim();
    const q = qRaw.toLowerCase();
    if (q.length < 2) {
      setVehicleOptions([]);
      setVehicleError('');
      setVehicleLoading(false);
      return;
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    const pool = [
      ...carModelsPH.map(c => ({ ...c, category: 'Car' })),
      ...(includeMotorcycles ? motorcycleModelsPH.map(m => ({ ...m, category: 'Moto' })) : [])
    ];
    const localMatches = pool.map(item => {
      const hay = `${item.make} ${item.model}`.toLowerCase();
      if (!tokens.every(t => hay.includes(t))) return null;
      let score = 0;
      tokens.forEach(t => { if (hay.startsWith(t)) score += 15; if (hay.includes(t)) score += 8; });
      const span = (item.kmPerLiterRange?.[1] || 0) - (item.kmPerLiterRange?.[0] || 0);
      score += Math.max(0, 10 - span);
      const baseYear = item.typicalYears?.split('-')[0] || '';
      const label = `${baseYear} ${item.make} ${item.model}${item.category === 'Moto' ? ' (Moto)' : ''}`;
      return { id: 'local-' + item.id, label, kmL: item.kmPerLiterAvg, year: item.typicalYears, make: item.make, model: item.model, score: score + 200, source: 'local' }; // Boost local
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 50);
    setVehicleOptions(localMatches);
    setVehicleError('');

    if (localMatches.length > 0) { setVehicleLoading(false); return; }

    const controller = new AbortController();
    setVehicleLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const base = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/records';
        let url;
        if (tokens.length >= 2) {
          const makeTk = tokens[0];
          const modelTk = tokens.slice(1).join(' ');
          const where = encodeURIComponent(`lower(make) LIKE '%${makeTk}%' AND lower(model) LIKE '%${modelTk}%'`);
          url = `${base}?limit=40&where=${where}`;
        } else {
          url = `${base}?limit=40&search=${encodeURIComponent(qRaw)}`;
        }
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('network');
        const data = await res.json();
        const remote = (data.results || []).map(r => {
          const make = (r.make || r.make_display || '').trim();
          const model = (r.model || r.basemodel || '').trim();
          const year = r.year || r.year_from || r.year_to || '';
          const comb = r.comb08 || r.fe_combined || r.fe_comb || r.comb_fe || null;
          const city = r.city08 || null;
          const hwy = r.highway08 || null;
          let mpg = comb;
          if (!mpg && city && hwy) mpg = (city * 0.55 + hwy * 0.45).toFixed(1);
          if (!mpg) return null;
          const label = `${year || 'Year?'} ${make} ${model}`.replace(/\s+/g, ' ').trim();
          let score = 0;
          const lcl = label.toLowerCase();
          tokens.forEach(t => { if (lcl.startsWith(t)) score += 10; if (lcl.includes(t)) score += 5; });
          return { id: 'remote-' + (r.id || `${make}-${model}-${year}`), label: label + ' (Global)', combMpg: mpg, kmL: mpgToKmL(parseFloat(mpg)), year, make, model, score: score + 50, source: 'remote' };
        }).filter(Boolean);
        const merged = [...localMatches, ...remote].sort((a, b) => b.score - a.score).slice(0, 50);
        if (!merged.length) setVehicleError('No matches found');
        setVehicleOptions(merged);
      } catch (e) {
        if (e.name !== 'AbortError') setVehicleError('Lookup failed');
      } finally {
        setVehicleLoading(false);
      }
    }, 450);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [vehicleQuery, includeMotorcycles]);

  const applyVehicle = (veh) => {
    setSelectedVehicle(veh);
    if (!veh) return;
    const cleanLabel = veh.label.replace(/ \((Moto|Global)\)$/, '');
    lastAppliedQueryRef.current = cleanLabel;
    setVehicleQuery(cleanLabel);
    setShowVehicleDropdown(false);
    setVehicleError('');
    if (veh.kmL) {
      setForm(f => ({ ...f, efficiencyUnit: 'km/L', efficiency: parseFloat(veh.kmL).toFixed(2) }));
    } else if (veh.combMpg) {
      const kmL = mpgToKmL(parseFloat(veh.combMpg));
      setForm(f => ({ ...f, efficiencyUnit: 'km/L', efficiency: kmL ? kmL.toFixed(2) : f.efficiency }));
    }
  };

  const canCalculate = useMemo(() => {
    if (form.useManualFuel) return form.manualFuelAmount && form.fuelPrice;
    return form.distance && form.efficiency && form.fuelPrice;
  }, [form]);

  // Animated counter values
  const animatedFuelRef = useRef(null);
  const animatedCostRef = useRef(null);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (!results) return;
    const dur = 650; // ms
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const start = performance.now();
    const targetFuel = results.litersNeeded;
    const targetCost = results.cost;
    function frame(now) {
      const p = Math.min(1, (now - start) / dur);
      const e = easeOut(p);
      if (animatedFuelRef.current) animatedFuelRef.current.textContent = (targetFuel * e).toFixed(2);
      if (animatedCostRef.current) animatedCostRef.current.textContent = (targetCost * e).toFixed(2);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [results]);

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

    // Save trip snapshot to localStorage ONLY if coming from Map Page (has start & end)
    try {
      const state = location.state || {};
      const startName = state.startName || null;
      const endName = state.endName || null;
      if (startName && endName) {
        const vehicleLabel = selectedVehicle?.label || (vehicleQuery ? vehicleQuery : null);
        addTrip({
          startName,
          endName,
          distanceKm: form.useManualFuel ? (Number.isFinite(distanceKm) ? Number(distanceKm?.toFixed?.(2) || distanceKm) : null) : Number(distanceKm?.toFixed?.(2) || distanceKm),
          litersNeeded: Number(litersNeeded?.toFixed?.(2) || litersNeeded) || 0,
          fuelCost: Number(cost?.toFixed?.(2) || cost) || 0,
          currency: form.currency,
          fuelType: form.fuelType,
          vehicleLabel,
        });
        // Show saved toast (persistent until cleared/reloaded)
        setSavedToast(true);
      }
    } catch { }
  };
  const clearAll = () => { setForm(initialState); setResults(null); setAttempted(false); };
  // Also clear the toast on clear/reload
  const _origClearAll = clearAll;
  const clearAllPatched = () => { _origClearAll(); setSavedToast(false); };
  const clearAllRef = clearAllPatched; // alias for concise usage below
  const reloadCalculator = () => { clearAllRef(); setReloadKey(k => k + 1); };


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
          {showErrors && (
            <div className="mb-4">
              <p className="text-red-500 text-sm">Please fill in all required fields.</p>
            </div>
          )}
          <header className="max-w-3xl mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Fuel Calculator</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-prose">Follow the numbered steps, then press Calculate.</p>
          </header>
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            { }
            <div className="flex-1 space-y-6 xl:pr-4 max-w-2xl w-full mx-auto">

              {/* Step 1: Vehicle Selection */}
              { }
              <section className={sectionCard + ' relative z-40'} aria-labelledby="stepVehicle">
                <h2 id="stepVehicle" className="text-lg font-semibold flex items-center"><span className={badge}>1</span>Vehicle (Optional)</h2>
                <p className="text-xs text-gray-500 -mt-1">Search PH models to auto-fill efficiency; edit manually if needed.</p>
                <div className="flex flex-col gap-2 relative">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="text"
                        value={vehicleQuery}
                        onChange={e => { const v = e.target.value; setVehicleQuery(v); if (v !== lastAppliedQueryRef.current) setShowVehicleDropdown(true); }}
                        placeholder="Search model (e.g. Toyota Vios, Click 125)"
                        className={
                          inputBase + ' w-full ' + (
                            showVehicleDropdown && !vehicleLoading && !vehicleError && vehicleQuery.length >= 2 ? 'rounded-b-none border-b-0' : ''
                          )
                        }
                      />
                      {!vehicleLoading && !vehicleError && vehicleOptions.length > 0 && showVehicleDropdown && (
                        <div className="absolute z-50 top-full left-0 w-full max-h-56 overflow-y-auto rounded-md rounded-t-none border border-t-0 border-gray-700 bg-gray-900 divide-y divide-gray-700 text-sm shadow-lg">
                          {vehicleOptions.map(o => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => applyVehicle(o)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-700/60 transition flex flex-col ${selectedVehicle?.id === o.id ? 'bg-gray-700/70' : ''}`}
                            >
                              <span className="font-medium text-gray-200">{o.label}</span>
                              <span className="text-[11px] text-gray-400">Avg: {o.kmL?.toFixed ? o.kmL.toFixed(2) : o.kmL} km/L{o.source === 'remote' ? ' • ext' : ''}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {vehicleQuery && !vehicleLoading && vehicleOptions.length === 0 && !vehicleError && showVehicleDropdown && (
                        <div className="absolute z-50 top-full left-0 w-full rounded-md rounded-t-none border border-t-0 border-gray-700 bg-gray-900 text-xs text-gray-500 px-3 py-2">No matches.</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setVehicleQuery(''); setVehicleOptions([]); setSelectedVehicle(null); lastAppliedQueryRef.current = ''; setShowVehicleDropdown(false); }}
                      className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-xs font-medium flex-shrink-0"
                    >Clear</button>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-gray-400 select-none">
                    <input type="checkbox" className="accent-indigo-500" checked={includeMotorcycles} onChange={e => setIncludeMotorcycles(e.target.checked)} />
                    Include motorcycles
                  </label>
                  {vehicleLoading && <p className="text-xs text-indigo-400">Loading vehicles...</p>}
                  {vehicleError && !selectedVehicle && <p className="text-xs text-rose-400">{vehicleError}</p>}
                  {selectedVehicle && (
                    <p className="text-xs text-teal-400">Applied {selectedVehicle.label}. You may adjust efficiency below.</p>
                  )}
                </div>
              </section>

              {/* Step 2: Trip & Efficiency */}
              <section className={sectionCard + ' relative ' + ((openDropdown === 'distanceUnit' || openDropdown === 'efficiencyUnit') ? 'z-40' : '')} aria-labelledby="step1">
                <h2 id="step1" className="text-lg font-semibold flex items-center"><span className={badge}>2</span>Trip Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Distance {showErrors && distanceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input ref={distanceInputRef} type="number" min="0" step="1" disabled={form.useManualFuel} value={form.distance} onChange={handleChange('distance')} placeholder="150" className={inputBase + (distanceMissing && showErrors ? ' border-rose-500' : '')} />
                      <div ref={distanceUnitRef} className="relative w-24">
                        <button type="button" disabled={form.useManualFuel} onClick={() => !form.useManualFuel && setOpenDropdown(d => d === 'distanceUnit' ? null : 'distanceUnit')} className={inputBase + ' flex justify-between items-center text-left !py-2 w-full ' + (openDropdown === 'distanceUnit' ? 'rounded-b-none border-b-0' : '') + (form.useManualFuel ? ' opacity-50 cursor-not-allowed' : '')}>
                          <span className="truncate capitalize">{form.distanceUnit}</span>
                          <svg className={`w-4 h-4 ml-1 transition-transform ${openDropdown === 'distanceUnit' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdown === 'distanceUnit' && (
                          <div className="absolute z-50 top-full left-0 w-full rounded-md rounded-t-none border border-t-0 border-gray-700 bg-gray-900 text-sm shadow-lg overflow-hidden">
                            {['km', 'miles'].map(opt => (
                              <button key={opt} type="button" onClick={() => { setForm(f => ({ ...f, distanceUnit: opt })); setOpenDropdown(null); }} className={`w-full px-3 py-2 text-left hover:bg-gray-700/60 transition ${form.distanceUnit === opt ? 'bg-gray-700/70 text-indigo-300' : 'text-gray-200'}`}>{opt}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">One-way distance.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Efficiency {showErrors && efficiencyMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="1" disabled={form.useManualFuel} value={form.efficiency} onChange={handleChange('efficiency')} placeholder={form.efficiencyUnit === 'L/100km' ? '7.5' : form.efficiencyUnit === 'km/L' ? '40' : '30'} className={inputBase + (efficiencyMissing && showErrors ? ' border-rose-500' : '')} />
                      <div ref={efficiencyUnitRef} className="relative w-28">
                        <button type="button" disabled={form.useManualFuel} onClick={() => !form.useManualFuel && setOpenDropdown(d => d === 'efficiencyUnit' ? null : 'efficiencyUnit')} className={inputBase + ' flex justify-between items-center text-left !py-2 w-full ' + (openDropdown === 'efficiencyUnit' ? 'rounded-b-none border-b-0' : '') + (form.useManualFuel ? ' opacity-50 cursor-not-allowed' : '')}>
                          <span className="truncate">{form.efficiencyUnit === 'mpg' ? 'mpg (US)' : form.efficiencyUnit}</span>
                          <svg className={`w-4 h-4 ml-1 transition-transform ${openDropdown === 'efficiencyUnit' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdown === 'efficiencyUnit' && (
                          <div className="absolute z-50 top-full left-0 w-full rounded-md rounded-t-none border border-t-0 border-gray-700 bg-gray-900 text-sm shadow-lg overflow-hidden">
                            {[
                              { value: 'L/100km', label: 'L/100km' },
                              { value: 'km/L', label: 'km/L' },
                              { value: 'mpg', label: 'mpg (US)' }
                            ].map(opt => (
                              <button key={opt.value} type="button" onClick={() => { setForm(f => ({ ...f, efficiencyUnit: opt.value })); setOpenDropdown(null); }} className={`w-full px-3 py-2 text-left hover:bg-gray-700/60 transition ${form.efficiencyUnit === opt.value ? 'bg-gray-700/70 text-indigo-300' : 'text-gray-200'}`}>{opt.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Average consumption.</p>
                  </div>
                </div>
                {form.useManualFuel && <p className="text-xs text-amber-400">Manual fuel enabled: distance & efficiency ignored.</p>}
              </section>

              {/* Step 3: Price */}
              <section className={sectionCard + ' relative ' + ((openDropdown === 'currency' || showFuelTypeDropdown) ? 'z-40' : '')} aria-labelledby="step2">
                <h2 id="step2" className="text-lg font-semibold flex items-center"><span className={badge}>3</span>Fuel Type & Price</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 max-w-sm relative" ref={fuelTypeRef}>
                    <label className={labelCls}>Fuel Type</label>
                    <button
                      type="button"
                      onClick={() => setShowFuelTypeDropdown(v => !v)}
                      className={
                        inputBase + ' flex justify-between items-center text-left !py-2 ' + (showFuelTypeDropdown ? 'rounded-b-none border-b-0' : '')
                      }
                      aria-haspopup="listbox"
                      aria-expanded={showFuelTypeDropdown}
                    >
                      <span className="truncate">{form.fuelType || 'Select fuel type'}</span>
                      <svg className={`w-4 h-4 ml-2 transition-transform ${showFuelTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showFuelTypeDropdown && (
                      <div className="absolute z-50 top-full left-0 w-full max-h-48 overflow-y-auto rounded-md rounded-t-none border border-t-0 border-gray-700 bg-gray-900 divide-y divide-gray-700 text-sm shadow-lg">
                        {['Gasoline / Unleaded (91)', 'Premium Gasoline (95 / 97 / 98)', 'Diesel'].map(ft => (
                          <button
                            type="button"
                            key={ft}
                            onClick={() => { setForm(f => ({ ...f, fuelType: ft })); setShowFuelTypeDropdown(false); }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-700/60 transition ${form.fuelType === ft ? 'bg-gray-700/70 text-indigo-300' : 'text-gray-200'}`}
                          >
                            {ft}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Price per Liter {showErrors && priceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2 max-w-sm">
                      <input type="number" min="0" step="1" value={form.fuelPrice} onChange={handleChange('fuelPrice')} placeholder="56" className={inputBase + (priceMissing && showErrors ? ' border-rose-500' : '')} />
                      <div ref={currencyRef} className="relative w-24">
                        <button type="button" onClick={() => setOpenDropdown(d => d === 'currency' ? null : 'currency')} className={inputBase + ' flex justify-between items-center text-left !py-2 w-full ' + (openDropdown === 'currency' ? 'rounded-b-none border-b-0' : '')}>
                          <span className="truncate">{form.currency}</span>
                          <svg className={`w-4 h-4 ml-1 transition-transform ${openDropdown === 'currency' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdown === 'currency' && (
                          <div className="absolute z-50 top-full left-0 w-full rounded-md rounded-t-none border border-t-0 border-gray-700 bg-gray-900 text-sm shadow-lg overflow-hidden">
                            {Object.keys(currencySymbols).map(c => (
                              <button key={c} type="button" onClick={() => { setForm(f => ({ ...f, currency: c })); setOpenDropdown(null); }} className={`w-full px-3 py-2 text-left hover:bg-gray-700/60 transition ${form.currency === c ? 'bg-gray-700/70 text-indigo-300' : 'text-gray-200'}`}>{c}</button>
                            ))}
                          </div>
                        )}
                      </div>
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
                { }
                <div className="flex flex-wrap gap-3">
                  <button onClick={performCalculation} disabled={!canCalculate} className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium shadow">Calculate</button>
                  <button onClick={clearAllRef} disabled={pristine} className="px-5 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium">Clear</button>
                  <button onClick={reloadCalculator} className="px-5 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm font-medium">Reload</button>
                </div>
                {!canCalculate && <p className="text-xs text-amber-400 -mt-2">Fill required fields on the left.</p>}
                {/* Results */}
                <div className="space-y-4">
                  {results ? (
                    <div className="grid grid-cols-2 gap-4 result-animate">
                      <div className="result-number-wrapper">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Fuel Needed</p>
                        <p className="text-2xl font-semibold mt-1"><span ref={animatedFuelRef}>{results.litersNeeded.toFixed(2)}</span> <span className="text-sm font-normal text-gray-400">L</span></p>
                      </div>
                      <div className="result-number-wrapper">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Estimated Cost</p>
                        <p className="text-2xl font-semibold mt-1">{symbol}<span ref={animatedCostRef}>{results.cost.toFixed(2)}</span> <span className="text-sm font-normal text-gray-400">{results.currency}</span></p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] text-gray-500">Calculated at {new Date(results.timestamp).toLocaleTimeString()}.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Enter inputs then press Calculate to see results.</p>
                  )}
                </div>
                {savedToast && (
                  <div className="rounded-md border border-teal-600/40 bg-teal-900/40 text-teal-200 text-sm px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex-1">Trip saved to My Trips.</span>
                    <button onClick={() => navigate('/my-trips')} className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow cursor-pointer">View here</button>
                  </div>
                )}
                {/* Tips */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center"><span className="text-indigo-400 mr-1">ℹ</span>Quick Tips</h3>
                  <ul className="text-xs list-disc pl-5 space-y-1 text-gray-400">
                    <li>Follow the steps on the left to calculate your fuel cost.</li>
                    <li>Toggle manual liters if you know exact fuel amount.</li>
                    <li>Driving style & conditions may change fuel  efficiency.</li>
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
