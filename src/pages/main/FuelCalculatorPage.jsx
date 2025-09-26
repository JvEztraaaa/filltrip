import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addTrip } from '../../others/services/trips';
import { motorcycleModelsPH, carModelsPH } from '../../others/data/fuelEfficiency';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';
import "./DropdownStyling.css";

// --- Helpers ---
// Convert miles to kilometers
const milesToKm = (m) => m * 1.60934;
// Convert vehicle efficiency to L/100km given value and unit
const toLitersPer100km = (v, unit) => {
  if (!v || v <= 0) return 0;
  switch (unit) {
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
  lastCalculated: null,
};
const currencySymbols = { PHP: '₱', USD: '$' };
const sectionCard = 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl px-6 py-6 flex flex-col gap-4 w-full';
const labelCls = 'block text-sm font-medium text-gray-300 mb-2';
const inputBase = 'w-full px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200';
// Convert US mpg to km/L
const mpgToKmL = (mpg) => mpg * 0.425143707; // US mpg to km/L

// Small reusable dropdown for unit/currency selections (distance/efficiency/currency)
// Preserves exact classes/structure to avoid any visual changes.
const DropdownMenu = React.forwardRef(
  (
    { menuKey, openDropdown, setOpenDropdown, value, options, onSelect },
    ref
  ) => {
    const isOpen = openDropdown === menuKey;
    return (
      <div ref={ref} className="fuel-dropdown-container">
        <button
          type="button"
          onClick={() => setOpenDropdown((d) => (d === menuKey ? null : menuKey))}
          className={`fuel-dropdown-button rounded-full cursor-pointer w-full ${isOpen ? 'open' : ''}`}
        >
          <span className="dropdown-text truncate">{value}</span>
          <svg className={`dropdown-arrow ${isOpen ? 'open' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="fuel-dropdown-content">
            {options.map((opt) => (
              <button
                key={typeof opt === 'string' ? opt : opt.value}
                type="button"
                onClick={() => { onSelect(typeof opt === 'string' ? opt : opt.value); setOpenDropdown(null); }}
                className={`fuel-dropdown-item ${value === (typeof opt === 'string' ? opt : opt.value) ? 'active' : ''}`}
              >
                {typeof opt === 'string' ? opt : opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
DropdownMenu.displayName = 'DropdownMenu';

// Fuel calculator page: estimate liters and cost from distance, efficiency, and price
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

  // Close any open dropdowns when clicking outside
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
  // Prefill distance when navigated from Map page
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
  // Local dataset search + remote fallback for vehicle lookup
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
      ...motorcycleModelsPH.map(m => ({ ...m, category: 'Moto' }))
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
  }, [vehicleQuery]);

  // Apply selected vehicle and prefill efficiency from dataset
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
    return form.distance && form.efficiency && form.fuelPrice && vehicleQuery.trim();
  }, [form, vehicleQuery]);

  // Animated counter values
  const animatedFuelRef = useRef(null);
  const animatedCostRef = useRef(null);
  const [savedToast, setSavedToast] = useState(false);

  // Animate results counters (liters and cost)
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

  // Perform calculation: liters needed and total cost
  const performCalculation = () => {
    setAttempted(true);
    if (!canCalculate) return;
    const dVal = parseFloat(form.distance);
    const eVal = parseFloat(form.efficiency);
    const price = parseFloat(form.fuelPrice);
    let distanceKm = form.distanceUnit === 'km' ? dVal : milesToKm(dVal || 0);
    if (!dVal || !eVal || !price) return; // guard
    const l100 = toLitersPer100km(eVal, form.efficiencyUnit);
    const litersNeeded = (distanceKm / 100) * l100;
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
          distanceKm: Number(distanceKm?.toFixed?.(2) || distanceKm),
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
  // Reset form and results
  const clearAll = () => { setForm(initialState); setResults(null); setAttempted(false); };
  // Also clear the toast on clear/reload
  const _origClearAll = clearAll;
  const clearAllPatched = () => { _origClearAll(); setSavedToast(false); };
  const clearAllRef = clearAllPatched; // alias for concise usage below
  const reloadCalculator = () => { clearAllRef(); setReloadKey(k => k + 1); };


  // Validation hints
  const showErrors = attempted && !canCalculate;
  const vehicleMissing = !vehicleQuery.trim();
  const distanceMissing = !form.distance;
  const efficiencyMissing = !form.efficiency;
  const priceMissing = !form.fuelPrice;

  return (
    <div key={reloadKey} className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden pb-12">
      <SidePanel />
      <Header />
      <div className="pt-20 pl-0 md:pl-64 w-full">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {showErrors && (
            <div className="mb-4">
              <p className="text-red-500 text-sm">Please fill in all required fields.</p>
            </div>
          )}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                  Fuel Calculator
                </h1>
                <p className="text-gray-400 text-base mt-2 max-w-2xl">
                  Follow the numbered steps, then press Calculate to estimate your fuel consumption patterns and fuel costs over time.
                </p>
              </div>
            </div>
          </header>
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            { }
            <div className="flex-1 space-y-6 xl:pr-4 max-w-2xl w-full mx-auto">

              {/* Step 1: Vehicle Selection */}
              <section className={sectionCard + ' relative z-40'} aria-labelledby="stepVehicle">
                <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 px-6 py-4 -mx-6 -mt-6 mb-4 border-b border-gray-700/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 id="stepVehicle" className="text-xl font-semibold text-white">
                        Vehicle {showErrors && vehicleMissing && <span className="text-rose-400 text-sm font-normal">required</span>}
                      </h2>
                      <p className="text-sm text-gray-400">
                        Search PH models for auto-fill efficiency or enter manually
                      </p>
                    </div>
                  </div>
                </div>
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
                          ) + (vehicleMissing && showErrors ? ' border-rose-500' : '')
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
                      className="px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-medium flex-shrink-0 transition-colors duration-200 cursor-pointer"
                    >Clear</button>
                  </div>
                  {/* Motorcycles are now included by default in search suggestions */}
                  {vehicleLoading && <p className="text-xs text-indigo-400">Loading vehicles...</p>}
                  {vehicleError && !selectedVehicle && <p className="text-xs text-rose-400">{vehicleError}</p>}
                  {selectedVehicle && (
                    <p className="text-xs text-teal-400">Applied {selectedVehicle.label}. You may adjust efficiency below.</p>
                  )}
                </div>
              </section>

              {/* Step 2: Trip & Efficiency */}
              <section className={sectionCard + ' relative ' + ((openDropdown === 'distanceUnit' || openDropdown === 'efficiencyUnit') ? 'z-40' : '')} aria-labelledby="step1">
                <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 px-6 py-4 -mx-6 -mt-6 mb-4 border-b border-gray-700/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 id="step1" className="text-xl font-semibold text-white">
                        Trip Details
                      </h2>
                      <p className="text-sm text-gray-400">
                        Enter your distance and fuel efficiency data
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Distance {showErrors && distanceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input ref={distanceInputRef} type="text" value={form.distance} onChange={handleChange('distance')} placeholder="150" className={inputBase + (distanceMissing && showErrors ? ' border-rose-500' : '')} />
                      <div ref={distanceUnitRef} className="relative w-28">
                        <DropdownMenu
                          menuKey="distanceUnit"
                          openDropdown={openDropdown}
                          setOpenDropdown={setOpenDropdown}
                          value={form.distanceUnit}
                          options={["km", "miles"]}
                          onSelect={(opt) => setForm((f) => ({ ...f, distanceUnit: opt }))}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">One-way distance.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Efficiency {showErrors && efficiencyMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.efficiency} onChange={handleChange('efficiency')} placeholder={form.efficiencyUnit === 'km/L' ? '40' : '30'} className={inputBase + (efficiencyMissing && showErrors ? ' border-rose-500' : '')} />
                      <div ref={efficiencyUnitRef} className="relative w-28">
                        <DropdownMenu
                          menuKey="efficiencyUnit"
                          openDropdown={openDropdown}
                          setOpenDropdown={setOpenDropdown}
                          value={form.efficiencyUnit === 'mpg' ? 'mpg' : form.efficiencyUnit}
                          options={[
                            { value: 'km/L', label: 'km/L' },
                            { value: 'mpg', label: 'mpg' }
                          ]}
                          onSelect={(opt) => setForm((f) => ({ ...f, efficiencyUnit: opt }))}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Average consumption.</p>
                  </div>
                </div>
              </section>

              {/* Step 3: Price */}
              <section className={sectionCard + ' relative ' + ((openDropdown === 'currency' || showFuelTypeDropdown) ? 'z-40' : '')} aria-labelledby="step2">
                <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 px-6 py-4 -mx-6 -mt-6 mb-4 border-b border-gray-700/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-7 h-7 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 id="step2" className="text-xl font-semibold text-white">
                        Fuel Type & Price
                      </h2>
                      <p className="text-sm text-gray-400">
                        Select fuel type and enter current price per liter
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 max-w-sm relative" ref={fuelTypeRef}>
                    <label className={labelCls}>Fuel Type</label>
                    <div className="fuel-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowFuelTypeDropdown(v => !v)}
                        className={`fuel-dropdown-button rounded-full cursor-pointer ${showFuelTypeDropdown ? 'open' : ''}`}
                        aria-haspopup="listbox"
                        aria-expanded={showFuelTypeDropdown}
                      >
                        <span className="dropdown-text">{form.fuelType || 'Select fuel type'}</span>
                        <svg className={`dropdown-arrow ${showFuelTypeDropdown ? 'open' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showFuelTypeDropdown && (
                        <div className="fuel-dropdown-content">
                          {['Gasoline / Unleaded (91)', 'Premium Gasoline (95 / 97 / 98)', 'Diesel'].map(ft => (
                            <button
                              type="button"
                              key={ft}
                              onClick={() => { setForm(f => ({ ...f, fuelType: ft })); setShowFuelTypeDropdown(false); }}
                              className={`fuel-dropdown-item ${form.fuelType === ft ? 'active' : ''}`}
                            >
                              {ft}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Price per Liter {showErrors && priceMissing && <span className="text-rose-400 text-xs font-normal">required</span>}</label>
                    <div className="flex gap-2 max-w-sm">
                      <input type="text" value={form.fuelPrice} onChange={handleChange('fuelPrice')} placeholder="56" className={inputBase + (priceMissing && showErrors ? ' border-rose-500' : '')} />
                      <div ref={currencyRef} className="relative w-28">
                        <DropdownMenu
                          menuKey="currency"
                          openDropdown={openDropdown}
                          setOpenDropdown={setOpenDropdown}
                          value={form.currency}
                          options={Object.keys(currencySymbols)}
                          onSelect={(c) => setForm((f) => ({ ...f, currency: c }))}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Prices vary by station; enter your actual price for accuracy.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right column: combined actions + results + tips */}
            <aside className="xl:w-[25rem] w-full flex-shrink-0 xl:sticky xl:top-24 mt-0 sm:mt-2 xl:mt-0">
              <div className={sectionCard}>
                <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 px-6 py-4 -mx-6 -mt-6 mb-4 border-b border-gray-700/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Summary & Actions
                      </h2>
                      <p className="text-sm text-gray-400">
                        Calculate and view your fuel consumption results
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <button onClick={performCalculation} disabled={!canCalculate} className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">Calculate</button>
                    <button onClick={clearAllRef} disabled={pristine} className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 cursor-pointer">Clear</button>
                    <button onClick={reloadCalculator} className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-medium transition-all duration-200 cursor-pointer">Reload</button>
                  </div>
                  {!canCalculate && <p className="text-xs text-amber-400">Fill required fields on the left.</p>}
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
                        <p className="text-[11px] text-gray-400">Calculated at {new Date(results.timestamp).toLocaleTimeString()}.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Enter inputs then press Calculate to see results.</p>
                  )}
                </div>
                {savedToast && (
                  <div className="rounded-md border border-teal-600/40 bg-teal-900/40 text-teal-200 text-sm px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex-1">Trip saved to My Trips.</span>
                    <button onClick={() => navigate('/my-trips')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-medium shadow-lg transition-all duration-200 cursor-pointer">View here</button>
                  </div>
                )}
                  {/* Tips */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-300">
                      <svg className="w-4 h-4 text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Tips
                    </h3>
                    <ul className="text-xs list-disc pl-5 space-y-1 text-gray-400">
                      <li>Follow the steps on the left to calculate your fuel cost.</li>
                      <li>Toggle manual liters if you know exact fuel amount.</li>
                      <li>Driving style & conditions may change fuel efficiency.</li>
                    </ul>
                  </div>
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
