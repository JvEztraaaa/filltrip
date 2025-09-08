import React, { useEffect, useMemo, useState } from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';
import { addRefuel, deleteRefuel, groupRefuelsByMonth, listRefuels, updateRefuel, computeDistanceSincePrev } from '../../services/refuel';

const currencySymbols = { PHP: '₱', USD: '$', EUR: '€', JPY: '¥' };
const FUEL_TYPES = ['Gasoline / Unleaded (91)', 'Premium Gasoline (95 / 97 / 98)', 'Diesel'];

function localInputValue(iso) {
    try {
        const d = new Date(iso);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().slice(0,16);
    } catch { return new Date().toISOString().slice(0,16); }
}

const RefuelHistoryPage = () => {
    const [groups, setGroups] = useState([]);
    const [form, setForm] = useState({
        createdAt: new Date().toISOString(),
        odometerKm: '',
        liters: '',
        pricePerLiter: '',
        totalCost: '',
        fuelType: FUEL_TYPES[0],
        station: '',
        currency: 'PHP',
    });
    const [editing, setEditing] = useState(null); // id
    const nowMax = useMemo(() => new Date().toISOString().slice(0,16), []);

    const refresh = () => setGroups(groupRefuelsByMonth(listRefuels()));
    useEffect(() => { refresh(); }, []);

    const symbol = currencySymbols[form.currency] || '';
    const autoTotal = useMemo(() => {
        const l = parseFloat(form.liters)||0;
        const p = parseFloat(form.pricePerLiter)||0;
        return (l*p)||0;
    }, [form.liters, form.pricePerLiter]);

    const submit = () => {
        const entry = {
            createdAt: form.createdAt,
            odometerKm: form.odometerKm,
            liters: form.liters,
            pricePerLiter: form.pricePerLiter,
            totalCost: form.totalCost||autoTotal,
            fuelType: form.fuelType,
            station: form.station,
            currency: form.currency,
        };
        if (editing) {
            updateRefuel(editing, entry);
        } else {
            addRefuel(entry);
        }
        setForm({ createdAt: new Date().toISOString(), odometerKm:'', liters:'', pricePerLiter:'', totalCost:'', fuelType: FUEL_TYPES[0], station:'', currency:'PHP' });
        setEditing(null);
        refresh();
    };

    const startEdit = (e) => {
        setEditing(e.id);
        setForm({
            createdAt: e.createdAt,
            odometerKm: e.odometerKm,
            liters: e.liters,
            pricePerLiter: e.pricePerLiter,
            totalCost: e.totalCost,
            fuelType: e.fuelType,
            station: e.station,
            currency: e.currency,
        });
    };

    const remove = (id) => { deleteRefuel(id); refresh(); };

    // Compute distances since previous fill-up (per overall chronology)
    const allSortedAsc = useMemo(() => listRefuels().sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)), [groups]);
    const distMap = useMemo(() => computeDistanceSincePrev(allSortedAsc), [allSortedAsc]);

    return (
        <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
            <SidePanel />
            <Header />
            <div className="pt-20 pl-0 md:pl-64 w-full">
                <div className="px-4 sm:px-6 max-w-6xl mx-auto">
                    <header className="mb-5">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Refuel History</h1>
                        <p className="text-gray-400 text-sm mt-1">Track your fuel-ups to monitor consumption and costs.</p>
                    </header>

                    {/* Entry form */}
                    <section className="rounded-lg border border-gray-700/70 bg-gray-800/60 backdrop-blur p-4 sm:p-5 mb-6">
                        <h2 className="text-lg font-semibold mb-3">Add Entry</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="text-xs text-gray-400">Date & Time</label>
                                <input type="datetime-local" max={nowMax} value={localInputValue(form.createdAt)} onChange={e=>setForm(f=>({ ...f, createdAt: new Date(e.target.value).toISOString() }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Odometer (km)</label>
                                <input type="number" min="0" step="0.1" value={form.odometerKm} onChange={e=>setForm(f=>({ ...f, odometerKm: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Fuel Amount (L)</label>
                                <input type="number" min="0" step="0.01" value={form.liters} onChange={e=>setForm(f=>({ ...f, liters: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Price per Liter</label>
                                <div className="flex gap-2">
                                    <input type="number" min="0" step="0.01" value={form.pricePerLiter} onChange={e=>setForm(f=>({ ...f, pricePerLiter: e.target.value }))} className="flex-1 mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm" />
                                    <select value={form.currency} onChange={e=>setForm(f=>({ ...f, currency: e.target.value }))} className="w-28 mt-1 px-2 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm">
                                        {Object.keys(currencySymbols).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Total Cost</label>
                                <input type="number" min="0" step="0.01" value={form.totalCost||autoTotal} onChange={e=>setForm(f=>({ ...f, totalCost: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Fuel Type</label>
                                <select value={form.fuelType} onChange={e=>setForm(f=>({ ...f, fuelType: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm">
                                    {FUEL_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="text-xs text-gray-400">Station/Location (optional)</label>
                                <input value={form.station} onChange={e=>setForm(f=>({ ...f, station: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm" />
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {editing && <button onClick={()=>{ setEditing(null); setForm({ createdAt: new Date().toISOString(), odometerKm:'', liters:'', pricePerLiter:'', totalCost:'', fuelType:FUEL_TYPES[0], station:'', currency:'PHP' }); }} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">Cancel</button>}
                            <button onClick={submit} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm font-medium shadow">{editing? 'Save Changes' : 'Add Entry'}</button>
                        </div>
                    </section>

                    {/* History list */}
                    {groups.length === 0 ? (
                        <div className="mt-10 text-center text-gray-400 text-sm">No refuel entries yet. Add one above to get started.</div>
                    ) : (
                        <div className="space-y-8 pb-20">
                            {groups.map(g => (
                                <section key={g.key}>
                                    <h2 className="text-lg font-semibold mb-3 text-gray-200">{g.label}</h2>
                                    <div className="grid gap-3">
                                        {g.items.map(e => {
                                            const sym = currencySymbols[e.currency] || '';
                                            const dist = distMap.get(e.id);
                                            return (
                                                <div key={e.id} className="w-full rounded-lg border border-gray-700/70 bg-gray-800/60 backdrop-blur p-3 sm:p-4 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm text-gray-200 font-medium">{new Date(e.createdAt).toLocaleString()}</div>
                                                            <div className="mt-1 text-[11px] text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                                <span>Odo: <span className="text-teal-300 font-semibold">{e.odometerKm} km</span></span>
                                                                {dist!=null && <><span className="text-gray-600">•</span><span>Since prev: <span className="text-indigo-300 font-semibold">{dist} km</span></span></>}
                                                                {e.station && <><span className="text-gray-600">•</span><span>Station: {e.station}</span></>}
                                                                <span className="text-gray-600">•</span><span>Fuel: <span className="text-teal-300">{e.fuelType}</span></span>
                                                            </div>
                                                        </div>
                                                        <div className="hidden sm:flex items-center gap-6">
                                                            <div className="text-right">
                                                                <div className="text-[11px] uppercase tracking-wide text-gray-400">Liters</div>
                                                                <div className="text-sm font-semibold text-teal-300">{e.liters} L</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[11px] uppercase tracking-wide text-gray-400">Price/L</div>
                                                                <div className="text-sm font-medium">{sym}{e.pricePerLiter}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[11px] uppercase tracking-wide text-gray-400">Total</div>
                                                                <div className="text-base font-bold text-indigo-300">{sym}{e.totalCost}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={()=>startEdit(e)} className="px-3 py-1.5 text-sm rounded-md bg-teal-500 hover:bg-teal-400 text-white shadow-sm">Edit</button>
                                                                <button onClick={()=>remove(e.id)} className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white shadow-sm">Delete</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 sm:hidden grid grid-cols-3 gap-2 text-center py-2 border-t border-gray-700/60">
                                                        <div>
                                                            <div className="text-[11px] uppercase tracking-wide text-gray-400">Liters</div>
                                                            <div className="text-sm font-semibold text-teal-300">{e.liters} L</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] uppercase tracking-wide text-gray-400">Price/L</div>
                                                            <div className="text-sm font-medium">{sym}{e.pricePerLiter}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] uppercase tracking-wide text-gray-400">Total</div>
                                                            <div className="text-sm font-bold text-indigo-300">{sym}{e.totalCost}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 sm:hidden grid grid-cols-2 gap-2">
                                                        <button onClick={()=>startEdit(e)} className="w-full px-4 py-2 text-sm rounded-md bg-teal-500 hover:bg-teal-400 text-white shadow-sm">Edit</button>
                                                        <button onClick={()=>remove(e.id)} className="w-full px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white shadow-sm">Delete</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefuelHistoryPage;
