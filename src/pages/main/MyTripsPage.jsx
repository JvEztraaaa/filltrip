import React, { useEffect, useState } from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';
import { listTrips, groupTripsByMonth, deleteTrip } from '../../services/trips';

const currencySymbols = { PHP: '₱', USD: '$', EUR: '€', JPY: '¥' };

const ellipsize = (str, max = 60) => {
    if (!str) return '';
    const s = String(str).trim();
    if (s.length <= max) return s;
    return s.slice(0, max - 1) + '…';
};

const sectionCard = 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-gray-700/50 backdrop-blur-sm shadow-xl';

const TripRow = ({ t, onDelete, isLatest = false }) => {
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
        <div className={`group relative ${sectionCard} transition-all duration-300 hover:shadow-lg ${
            isLatest 
                ? "border-teal-500/50 shadow-lg shadow-teal-500/10" 
                : "hover:border-gray-600/80"
        } px-3 sm:px-4 py-3 overflow-hidden break-words`}>
            
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 max-w-full">
                    <div className="text-sm sm:text-base font-semibold text-white flex items-center min-w-0 mb-1.5">
                        <span className="truncate text-teal-300" title={startTitle}>{startShort}</span>
                        <div className="mx-2 sm:mx-3 flex items-center">
                            <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="truncate text-indigo-300" title={endTitle}>{endShort}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span title={when}>{when}</span>
                        </div>
                        {t.vehicleLabel && (
                            <>
                                <span className="text-gray-600">•</span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z" />
                                    </svg>
                                    <span className="truncate" title={vehicleTitle}>{vehicleShort}</span>
                                </div>
                            </>
                        )}
                        {t.fuelType && (
                            <>
                                <span className="text-gray-600">•</span>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-teal-300">{t.fuelType}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="shrink-0 flex items-start">
                    <button
                        onClick={() => onDelete(t)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
            {/* Compact Stats Grid */}
            <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 rounded-md bg-gray-700/15 border border-gray-600/20">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-0.5">Distance</div>
                    <div className="text-sm sm:text-base font-semibold text-teal-300">{t.distanceKm ? `${t.distanceKm} km` : '—'}</div>
                </div>
                <div className="text-center p-2.5 rounded-md bg-gray-700/15 border border-gray-600/20">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-0.5">Fuel</div>
                    <div className="text-sm sm:text-base font-semibold text-indigo-300">{(t.litersNeeded?.toFixed ? t.litersNeeded.toFixed(2) : t.litersNeeded) || 0} L</div>
                </div>
                <div className="text-center p-2.5 rounded-md bg-gray-700/15 border border-gray-600/20">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-0.5">Cost</div>
                    <div className="text-sm sm:text-base font-semibold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">{symbol}{t.fuelCost?.toFixed ? t.fuelCost.toFixed(2) : t.fuelCost}</div>
                </div>
            </div>
        </div>
    );
};

const MyTripsPage = () => {
    const [groups, setGroups] = useState([]);
    const [confirm, setConfirm] = useState(null); // { id, title }

    useEffect(() => {
        const trips = listTrips();
        setGroups(groupTripsByMonth(trips));
    }, []);

    const refresh = () => setGroups(groupTripsByMonth(listTrips()));

    // Editing functionality removed per requirements

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
                <div className="px-4 sm:px-6 max-w-7xl mx-auto">
                    {/* Header Section */}
                    <header className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                                    My Trips
                                </h1>
                                <p className="text-gray-400">
                                    Your calculated trips are saved here. Grouped by month.
                                </p>
                            </div>
                            {groups.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                    <span>Total Entries: <span className="text-teal-400 font-semibold">{groups.reduce((total, group) => total + group.items.length, 0)}</span></span>
                                </div>
                            )}
                        </div>
                    </header>

                    {groups.length === 0 ? (
                        <div className={`${sectionCard} p-12 text-center`}>
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v13l-6 3-6-3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-2">No trips yet</h3>
                                <p className="text-gray-400 mb-6">Calculate a trip in the Fuel Calculator to add your first entry.</p>
                                <button
                                    onClick={() => window.location.href = '/fuel-calculator'}
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                                >
                                    Start Calculating
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-20">
                            {groups.map((g, groupIndex) => {
                                const isFirstGroup = groupIndex === 0;
                                return (
                                    <section key={g.key}>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                                            <h2 className="text-xl font-bold text-gray-200 px-4">{g.label}</h2>
                                            <div className="flex-1 h-px bg-gradient-to-l from-gray-600 to-transparent"></div>
                                        </div>
                                        <div className="grid gap-6">
                                            {g.items.map((trip, tripIndex) => {
                                                const isLatestTrip = isFirstGroup && tripIndex === 0;
                                                return (
                                                    <TripRow 
                                                        key={trip.id} 
                                                        t={trip} 
                                                        onDelete={askDelete}
                                                        isLatest={isLatestTrip}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>


            {/* Delete Confirm */}
            {confirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`${sectionCard} w-full max-w-md`}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Delete Trip?</h3>
                                    <p className="text-sm text-gray-400 mt-1">This action cannot be undone.</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
                                <p className="text-sm text-gray-300">
                                    You're about to delete: <span className="font-medium text-white">"{confirm.title}"</span>
                                </p>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={cancelDelete} 
                                    className="px-4 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium shadow-lg transition-all duration-200 cursor-pointer"
                                >
                                    Delete Trip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTripsPage;
