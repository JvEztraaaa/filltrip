import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const StatsItem = ({ label, children, valueClassName }) => (
  <div className="text-center p-2.5 rounded-md bg-gray-700/15 border border-gray-600/20">
    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-0.5">{label}</div>
    <div className={valueClassName}>{children}</div>
  </div>
);

const TripRow = ({ t, onDelete, isLatest = false }) => {
  const d = new Date(t.createdAt);
  const when = isNaN(d) ? '' : `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const startTitle = t.startName || t.startLocationName || 'Start?';
  const endTitle = t.endName || t.endLocationName || 'End?';
  const startShort = ellipsize(startTitle, 48);
  const endShort = ellipsize(endTitle, 48);
  const vehicleTitle = t.vehicleLabel ? `Vehicle: ${t.vehicleLabel}` : 'Vehicle: —';
  const vehicleShort = ellipsize(vehicleTitle, 64);
  const symbol = currencySymbols[t.currency] || (t.currency || '');

  return (
    <div className={`group relative ${sectionCard} transition-all duration-300 hover:shadow-lg ${
      isLatest ? "border-teal-500/50 shadow-lg shadow-teal-500/10" : "hover:border-gray-600/80"
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
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 00-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatsItem label="Distance" valueClassName="text-sm sm:text-base font-semibold text-teal-300">
          {t.distanceKm ? `${Number(t.distanceKm).toFixed(2)} km` : '—'}
        </StatsItem>
        <StatsItem label="Fuel" valueClassName="text-sm sm:text-base font-semibold text-indigo-300">
          {(t.litersNeeded?.toFixed ? t.litersNeeded.toFixed(2) : Number(t.litersNeeded || 0).toFixed(2))} L
        </StatsItem>
        <StatsItem label="Cost" valueClassName="text-sm sm:text-base font-semibold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
          {symbol}{(t.fuelCost?.toFixed ? t.fuelCost.toFixed(2) : Number(t.fuelCost || 0).toFixed(2))}
        </StatsItem>
      </div>
    </div>
  );
};

const MyTripsPage = () => {
  const [groups, setGroups] = useState([]);
  const [confirm, setConfirm] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const marginX = 36;
      const startY = 64;

      const title = 'My Trips Report';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, marginX, 40);

      const rows = [];
      const headers = [
        'Date',
        'Start',
        'End',
        'Vehicle',
        'Fuel Type',
        'Distance (km)',
        'Fuel (L)',
        'Cost',
      ];

      const allTrips = groups.flatMap(g => g.items || []);
      for (const t of allTrips) {
        const d = new Date(t.createdAt);
        const dateStr = isNaN(d) ? '' : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const startTitle = t.startName || t.startLocationName || '';
        const endTitle = t.endName || t.endLocationName || '';
        const vehicle = t.vehicleLabel || '';
        const fuelType = t.fuelType || '';
        const distance = t.distanceKm ? Number(t.distanceKm).toFixed(2) : '';
        const liters = (t.litersNeeded?.toFixed ? t.litersNeeded.toFixed(2) : Number(t.litersNeeded || 0).toFixed(2));
        const symbol = currencySymbols[t.currency] || (t.currency || '');
        const costNum = (t.fuelCost?.toFixed ? Number(t.fuelCost) : Number(t.fuelCost || 0));
        const currencyPrefix = symbol === '₱' ? 'PHP ' : (symbol ? `${symbol} ` : '');
        const cost = `${currencyPrefix}${costNum.toFixed(2)}`;
        rows.push([dateStr, startTitle, endTitle, vehicle, fuelType, distance, liters, cost]);
      }

      // Grouping label rows per month for readability (optional)
      // If needed later, can insert section headers using autoTable hooks.

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY,
        styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', valign: 'top' },
        bodyStyles: { valign: 'top' },
        headStyles: { fillColor: [15, 23, 42], textColor: 255 }, // slate-900
        alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: 100 },                 // Date
          1: { cellWidth: 160, overflow: 'linebreak' }, // Start
          2: { cellWidth: 160, overflow: 'linebreak' }, // End
          3: { cellWidth: 85 },                  // Vehicle
          4: { cellWidth: 95 },                  // Fuel Type
          5: { halign: 'right', cellWidth: 55 }, // Distance (km)
          6: { halign: 'right', cellWidth: 50 }, // Fuel (L)
          7: { halign: 'right', cellWidth: 65 }, // Cost
        },
        // Let autoTable manage widths to fit page; long text wraps.
        didDrawPage: (data) => {
          // Footer with page number
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.getWidth();
          const pageHeight = pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(120);
          const page = (typeof doc.getNumberOfPages === 'function') ? doc.getNumberOfPages() : (doc.internal?.getNumberOfPages?.() || 1);
          doc.text(`Page ${page}`, pageWidth - marginX, pageHeight - 20, { align: 'right' });
        },
        margin: { left: marginX, right: marginX },
      });

      const now = new Date();
      const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      doc.save(`my_trips_${ymd}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Failed to export PDF.');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const arr = await listTrips();               // <-- await!
        setGroups(groupTripsByMonth(arr));
      } catch (e) {
        setErr(e?.message || 'Failed to load trips');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    try {
      const arr = await listTrips();                 // <-- await!
      setGroups(groupTripsByMonth(arr));
    } catch {
      setGroups([]);
    }
  };

  const askDelete = (trip) =>
    setConfirm({ id: trip.id, title: `${trip.startName || trip.startLocationName || 'Start?'} → ${trip.endName || trip.endLocationName || 'End?'}` });

  const cancelDelete = () => setConfirm(null);

  const confirmDelete = async () => {
    if (!confirm) return;
    try {
      await deleteTrip(confirm.id);                  // <-- await!
      await refresh();                               // <-- refresh async
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
      <SidePanel />
      <Header />
      <div className="pt-20 pl-0 md:pl-64 w-full">
        <div className="px-4 sm:px-6 max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  My Trips
                </h1>
                <p className="text-gray-400">Your calculated trips are saved here. Grouped by month.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700/50">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Total Entries
                  </div>
                  <div className="text-xl font-bold text-teal-400">
                    {groups.reduce((total, g) => total + g.items.length, 0)}
                  </div>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium shadow-lg transition-all duration-200 cursor-pointer"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </header>

          {loading && <p className="text-gray-400">Loading…</p>}
          {err && !loading && <p className="text-rose-400">{err}</p>}

          {!loading && !err && groups.length === 0 ? (
            <div className={`${sectionCard} p-12 text-center`}>
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v13l-6 3-6-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">No trips yet</h3>
                <p className="text-gray-400 mb-6">Calculate a trip in the Fuel Calculator to add your first entry.</p>
                <a
                  href="/fuel-calculator"
                  className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  Start Calculating
                </a>
              </div>
            </div>
          ) : null}

          {!loading && !err && groups.length > 0 && (
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