import React, { useEffect, useState, useMemo } from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';
import { listTrips, groupTripsByMonth, deleteTrip, updateTrip, getTrip } from '../../services/trips';

const currencySymbols = { PHP: '₱', USD: '$', EUR: '€', JPY: '¥' };
const FUEL_TYPES = ['Gasoline / Unleaded (91)', 'Premium Gasoline (95 / 97 / 98)', 'Diesel'];

const ellipsize = (str, max = 60) => {
    if (!str) return '';
    const s = String(str).trim();
    if (s.length <= max) return s;
    return s.slice(0, max - 1) + '…';
};

const TripRow = ({ t, onEdit, onDelete }) => {
    const d = new Date(t.createdAt);
    const when = isNaN(d) ? '' : `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const startTitle = t.startName || 'Start?';
    const endTitle = t.endName || 'End?';
    const startShort = ellipsize(startTitle, 48);
    const endShort = ellipsize(endTitle, 48);
    const vehicleTitle = t.vehicleLabel ? `Vehicle: ${t.vehicleLabel}` : 'Vehicle: —';
    const vehicleShort = ellipsize(vehicleTitle, 64);
    const symbol = currencySymbols[t.currency] || (t.currency || '');
    return (
        <div className="w-full rounded-md sm:rounded-lg border border-gray-700/70 bg-gray-800/60 backdrop-blur p-3 sm:p-4 shadow-sm overflow-hidden break-words">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 max-w-full">
                    <div className="text-sm font-semibold text-gray-100 flex items-center min-w-0">
                        <span className="truncate" title={startTitle}>{startShort}</span>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="truncate" title={endTitle}>{endShort}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="truncate" title={when}>{when}</span>
                        <span className="text-gray-600">•</span>
                        <span className="truncate" title={vehicleTitle}>{vehicleShort}</span>
                        <span className="text-gray-600">•</span>
                        <span className="truncate text-teal-300">Fuel: {t.fuelType || '—'}</span>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400">Distance</div>
                        <div className="text-sm font-semibold text-teal-300">{t.distanceKm ? `${t.distanceKm} km` : '—'}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400">Fuel Used</div>
                        <div className="text-sm font-semibold text-teal-300">{(t.litersNeeded?.toFixed ? t.litersNeeded.toFixed(2) : t.litersNeeded) || 0} L</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400">Cost</div>
                        <div className="text-base font-bold text-indigo-300">{symbol}{t.fuelCost?.toFixed ? t.fuelCost.toFixed(2) : t.fuelCost}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <button onClick={() => onEdit(t)} className="px-3.5 py-1.5 text-sm rounded-md bg-teal-500 hover:bg-teal-400 text-white shadow-sm ring-1 ring-teal-300/40 cursor-pointer">Edit</button>
                        <button onClick={() => onDelete(t)} className="px-3.5 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white shadow-sm cursor-pointer">Delete</button>
                    </div>
                </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden text-center py-2 border-y border-gray-700/60">
                <div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-400">Distance</div>
                    <div className="text-sm font-semibold text-teal-300">{t.distanceKm ? `${t.distanceKm} km` : '—'}</div>
                </div>
                <div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-400">Fuel Used</div>
                    <div className="text-sm font-semibold text-teal-300">{(t.litersNeeded?.toFixed ? t.litersNeeded.toFixed(2) : t.litersNeeded) || 0} L</div>
                </div>
                <div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-400">Cost</div>
                    <div className="text-sm font-bold text-indigo-300">{symbol}{t.fuelCost?.toFixed ? t.fuelCost.toFixed(2) : t.fuelCost}</div>
                </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-700/60 sm:hidden grid grid-cols-2 gap-2">
                <button onClick={() => onEdit(t)} className="w-full px-4 py-2 text-sm rounded-md bg-teal-500 hover:bg-teal-400 text-white shadow-sm ring-1 ring-teal-300/40 cursor-pointer">Edit</button>
                <button onClick={() => onDelete(t)} className="w-full px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white shadow-sm cursor-pointer">Delete</button>
            </div>
        </div>
    );
};

const MyTripsPage = () => {
    const [groups, setGroups] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [confirm, setConfirm] = useState(null); // { id, title }
    // Local-time "now" for datetime-local max to allow selecting current day/time
    const nowMax = useMemo(() => {
        const d = new Date();
        const tz = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tz).toISOString().slice(0, 16);
    }, []);
    const [openCurrency, setOpenCurrency] = useState(false);
    const [openFuelType, setOpenFuelType] = useState(false);
    const currencyWrapRef = React.useRef(null);
    const fuelTypeWrapRef = React.useRef(null);

    useEffect(() => {
        const onDown = (e) => {
            if (currencyWrapRef.current && !currencyWrapRef.current.contains(e.target)) setOpenCurrency(false);
            if (fuelTypeWrapRef.current && !fuelTypeWrapRef.current.contains(e.target)) setOpenFuelType(false);
        };
        if (editingId) document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [editingId]);

    useEffect(() => {
        const trips = listTrips();
        setGroups(groupTripsByMonth(trips));
    }, []);

    const refresh = () => setGroups(groupTripsByMonth(listTrips()));

    const openEdit = (trip) => {
        setEditingId(trip.id);
        setEditForm({
            startName: trip.startName || '',
            endName: trip.endName || '',
            distanceKm: trip.distanceKm ?? '',
            litersNeeded: trip.litersNeeded ?? '',
            fuelCost: trip.fuelCost ?? '',
            currency: trip.currency || 'PHP',
            fuelType: trip.fuelType || '',
            vehicleLabel: trip.vehicleLabel || '',
            createdAt: trip.createdAt || new Date().toISOString(),
        });
    };
    const closeEdit = () => { setEditingId(null); setEditForm(null); };

    const handleSaveEdit = () => {
        if (!editingId || !editForm) return;
        // Prevent future dates
        const chosen = new Date(editForm.createdAt);
        const now = new Date();
        if (chosen > now) {
            // clamp to now
            editForm.createdAt = now.toISOString();
        }
        updateTrip(editingId, editForm);
        closeEdit();
        refresh();
    };

    const askDelete = (trip) => setConfirm({ id: trip.id, title: `${trip.startName || 'Start?'} → ${trip.endName || 'End?'}` });
    const cancelDelete = () => setConfirm(null);
    const confirmDelete = () => {
        if (!confirm) return;
        deleteTrip(confirm.id);
        setConfirm(null);
        refresh();
    };

    return (
        <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
            <SidePanel />
            <Header />
            <div className="pt-20 pl-0 md:pl-64 w-full">
                <div className="px-4 sm:px-6 max-w-6xl mx-auto">
                    <header className="mb-5">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">My Trips</h1>
                        <p className="text-gray-400 text-sm mt-1">Your calculated trips are saved here. Grouped by month.</p>
                    </header>

                    {groups.length === 0 ? (
                        <div className="mt-10 text-center text-gray-400 text-sm">No trips yet. Calculate a trip in the Fuel Calculator to add one.</div>
                    ) : (
                        <div className="space-y-8 pb-20">
                            {groups.map(g => (
                                <section key={g.key}>
                                    <h2 className="text-lg font-semibold mb-3 text-gray-200">{g.label}</h2>
                                    <div className="grid gap-3">
                                        {g.items.map(trip => (
                                            <TripRow key={trip.id} t={trip} onEdit={openEdit} onDelete={askDelete} />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingId && editForm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-2 sm:p-4">
                    <div className="w-full max-w-xl rounded-lg bg-gray-900 border border-gray-700 text-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="text-base font-semibold">Edit Trip</h3>
                            <button onClick={closeEdit} className="text-gray-400 hover:text-gray-200 cursor-pointer">✕</button>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400">Start</label>
                                <input value={editForm.startName} onChange={e => setEditForm(f => ({ ...f, startName: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">End</label>
                                <input value={editForm.endName} onChange={e => setEditForm(f => ({ ...f, endName: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Distance (km)</label>
                                <input type="number" step="0.01" value={editForm.distanceKm} onChange={e => setEditForm(f => ({ ...f, distanceKm: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Fuel Used (L)</label>
                                <input type="number" step="0.01" value={editForm.litersNeeded} onChange={e => setEditForm(f => ({ ...f, litersNeeded: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Cost</label>
                                <input type="number" step="0.01" value={editForm.fuelCost} onChange={e => setEditForm(f => ({ ...f, fuelCost: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                            </div>
                            <div ref={currencyWrapRef} className="relative">
                                <label className="text-xs text-gray-400">Currency</label>
                                <button type="button" onClick={() => setOpenCurrency(v => !v)} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm flex items-center justify-between">
                                    <span>{editForm.currency}</span>
                                    <svg className={`w-4 h-4 ml-2 transition-transform ${openCurrency ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {openCurrency && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-gray-700 bg-gray-900 text-sm shadow-lg overflow-hidden">
                                        {['PHP','USD','EUR','JPY'].map(c => (
                                            <button key={c} type="button" onClick={() => { setEditForm(f => ({ ...f, currency: c })); setOpenCurrency(false); }} className={`w-full px-3 py-2 text-left hover:bg-gray-700/60 transition ${editForm.currency === c ? 'bg-gray-700/70 text-indigo-300' : 'text-gray-200'}`}>{c}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div ref={fuelTypeWrapRef} className="relative sm:col-span-2">
                                <label className="text-xs text-gray-400">Fuel Type</label>
                                <button type="button" onClick={() => setOpenFuelType(v => !v)} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm flex items-center justify-between">
                                    <span className="truncate">{editForm.fuelType}</span>
                                    <svg className={`w-4 h-4 ml-2 transition-transform ${openFuelType ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {openFuelType && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-700 bg-gray-900 text-sm shadow-lg">
                                        {FUEL_TYPES.map(ft => (
                                            <button key={ft} type="button" onClick={() => { setEditForm(f => ({ ...f, fuelType: ft })); setOpenFuelType(false); }} className={`w-full px-3 py-2 text-left hover:bg-gray-700/60 transition ${editForm.fuelType === ft ? 'bg-gray-700/70 text-indigo-300' : 'text-gray-200'}`}>{ft}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs text-gray-400">Vehicle</label>
                                <input value={editForm.vehicleLabel} onChange={e => setEditForm(f => ({ ...f, vehicleLabel: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                            </div>
                                                                                                        <div className="sm:col-span-2">
                                <label className="text-xs text-gray-400">Date/Time</label>
                                                                <input type="datetime-local" max={nowMax} value={(function(){
                                                                        try {
                                                                            const d = new Date(editForm.createdAt);
                                                                            const tzOffset = d.getTimezoneOffset() * 60000;
                                                                            return new Date(d.getTime() - tzOffset).toISOString().slice(0,16);
                                                                        } catch { return nowMax; }
                                                                    })()} onChange={e => {
                                                                        const val = e.target.value; // yyyy-MM-ddTHH:mm (local)
                                                                        if (!val) return;
                                                                        const local = new Date(val);
                                                                        // Store as ISO in UTC to keep consistency
                                                                        setEditForm(f => ({ ...f, createdAt: new Date(local.getTime()).toISOString() }));
                                                                }} className="w-full mt-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 outline-none text-sm" />
                                {new Date(editForm.createdAt) > new Date() && (
                                    <p className="text-xs text-rose-400 mt-1">Date cannot be in the future.</p>
                                )}
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-2">
                            <button onClick={closeEdit} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={new Date(editForm.createdAt) > new Date()} className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white cursor-pointer">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {confirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-lg bg-gray-900 border border-gray-700 text-white shadow-xl p-4">
                        <h3 className="text-base font-semibold mb-2">Delete trip?</h3>
                        <p className="text-sm text-gray-300 mb-4">This will remove "{confirm.title}" from your history.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={cancelDelete} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm cursor-pointer">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-sm text-white cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTripsPage;
