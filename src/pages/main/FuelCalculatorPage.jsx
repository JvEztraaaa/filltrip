import React, { useState, useMemo } from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';

// --- Helpers ---
const milesToKm = (m) => m * 1.60934;
const toLitersPer100km = (v, unit) => {
  if (!v || v <= 0) return 0;
  switch (unit) {
    case 'L/100km': return v;
    case 'km/L': return 100 / v;
    case 'mpg': return 235.214583 / v; // US mpg
    default: return 0;
  }
};

const initialState = {
  distance: '',
  distanceUnit: 'km',
  efficiency: '',
  efficiencyUnit: 'L/100km',
  fuelPrice: '',
  currency: 'PHP', // Default to PHP as requested
  manualFuelAmount: '',
  useManualFuel: false,
  lastCalculated: null,
};
const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', GBP: '£', JPY: '¥' };

const badge = 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-medium mr-2 shadow';
const sectionCard = 'rounded-lg border border-gray-700/70 bg-gray-800/60 backdrop-blur px-5 sm:px-6 py-5 flex flex-col gap-3 w-full';
const labelCls = 'text-sm font-medium flex items-center gap-2';
const inputBase = 'w-full rounded-md bg-gray-900/40 border border-gray-700 focus:border-indigo-500 focus:ring-0 outline-none px-3 py-2 text-sm placeholder-gray-500 transition';
const selectBase = 'rounded-md bg-gray-900/40 border border-gray-700 focus:border-indigo-500 outline-none px-2 py-2 text-sm';

const FuelCalculatorPage = () => {
  const [form, setForm] = useState(initialState);
  const [results, setResults] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [attempted, setAttempted] = useState(false);

  const pristine = useMemo(() => JSON.stringify(form) === JSON.stringify(initialState) && !results, [form, results]);
  const symbol = currencySymbols[form.currency] || '';

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
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

              {/* Step 1: Trip & Efficiency */}
              <section className={sectionCard} aria-labelledby="step1">
                <h2 id="step1" className="text-lg font-semibold flex items-center"><span className={badge}>1</span>Trip Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Distance {showErrors && distanceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="0.01" disabled={form.useManualFuel} value={form.distance} onChange={handleChange('distance')} placeholder="150" className={inputBase + (distanceMissing && showErrors ? ' border-rose-500' : '')} />
                      <select disabled={form.useManualFuel} value={form.distanceUnit} onChange={handleChange('distanceUnit')} className={selectBase}>
                        <option value="km">km</option><option value="miles">miles</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">One-way distance.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Efficiency {showErrors && efficiencyMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input type="number" min="0" step="0.01" disabled={form.useManualFuel} value={form.efficiency} onChange={handleChange('efficiency')} placeholder={form.efficiencyUnit === 'L/100km' ? '7.5' : form.efficiencyUnit === 'km/L' ? '14' : '30'} className={inputBase + (efficiencyMissing && showErrors ? ' border-rose-500' : '')} />
                      <select disabled={form.useManualFuel} value={form.efficiencyUnit} onChange={handleChange('efficiencyUnit')} className={selectBase}>
                        <option value="L/100km">L/100km</option><option value="km/L">km/L</option><option value="mpg">mpg (US)</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">Average consumption.</p>
                  </div>
                </div>
                {form.useManualFuel && <p className="text-xs text-amber-400">Manual fuel enabled: distance & efficiency ignored.</p>}
              </section>

              {/* Step 2: Price */}
              <section className={sectionCard} aria-labelledby="step2">
                <h2 id="step2" className="text-lg font-semibold flex items-center"><span className={badge}>2</span>Fuel Price</h2>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Price per Liter {showErrors && priceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                  <div className="flex gap-2 max-w-sm">
                    <input type="number" min="0" step="0.01" value={form.fuelPrice} onChange={handleChange('fuelPrice')} placeholder="1.35" className={inputBase + (priceMissing && showErrors ? ' border-rose-500' : '')} />
                    <select value={form.currency} onChange={handleChange('currency')} className={selectBase}>
                      {Object.keys(currencySymbols).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">Use current station or average regional price.</p>
                </div>
              </section>

              {/* Step 3: Optional override */}
              <section className={sectionCard} aria-labelledby="step3">
                <h2 id="step3" className="text-lg font-semibold flex items-center"><span className={badge}>3</span>Optional Override</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-indigo-500" checked={form.useManualFuel} onChange={handleChange('useManualFuel')} />
                  Enter fuel amount directly (liters)
                </label>
                <div className="flex gap-3 max-w-xs">
                  <input type="number" min="0" step="0.01" disabled={!form.useManualFuel} value={form.manualFuelAmount} onChange={handleChange('manualFuelAmount')} placeholder="35" className={inputBase + (!form.useManualFuel ? ' opacity-50 cursor-not-allowed' : '') + (manualMissing && showErrors ? ' border-rose-500' : '')} />
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
