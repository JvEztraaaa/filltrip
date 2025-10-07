// Statistics aggregation utilities.
// Consumes raw trips and refuel entries returned from backend endpoints.
// Each function is pure and side-effect free to allow reuse + easy testing.

// Trip object expectations (based on existing trips.js):
// { id, startLocationName, endLocationName, distanceKm, litersNeeded, fuelCost, pricePerLiter, vehicleLabel, createdAt }
// Refuel object expectations (based on refuel.js):
// { id, createdAt, liters, pricePerLiter, totalCost, vehicleName, odometerKm }

function safeNum(v) { const n = Number(v); return isFinite(n) ? n : 0; }

export function computeKpis(trips = [], refuels = []) {
  // Total trips
  const totalTrips = trips.length;
  // Distance & Fuel (from trips)
  const totalDistance = trips.reduce((s,t)=> s + safeNum(t.distanceKm), 0);
  const totalFuelConsumed = trips.reduce((s,t)=> s + safeNum(t.litersNeeded), 0);
  const totalFuelCost = trips.reduce((s,t)=> s + safeNum(t.fuelCost), 0);

  // Average cost per 100km (avoid division by zero)
  const avgCostPer100Km = totalDistance > 0 ? (totalFuelCost / totalDistance) * 100 : 0;

  // Most used vehicle (by trips frequency)
  const vehicleCounts = {};
  for (const t of trips) {
    const v = t.vehicleLabel || t.vehicleName || '—';
    vehicleCounts[v] = (vehicleCounts[v] || 0) + 1;
  }
  let mostUsedVehicle = '—';
  let maxCount = 0;
  Object.entries(vehicleCounts).forEach(([v,c])=> { if (c>maxCount) { maxCount = c; mostUsedVehicle = v; } });

  return {
    totalTrips,
    totalDistance,
    totalFuelConsumed,
    totalFuelCost,
    avgCostPer100Km,
    mostUsedVehicle,
  };
}

// Helper to group by YYYY-MM key
function monthKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function sortMonthKeys(keys) {
  return keys.sort((a,b)=> a.localeCompare(b)); // chronological ascending
}

// Return only the month name (short) for display.
// Previously we included a 2-digit year (e.g. "Jan 25"), which looked like a day (25) to users.
// Keeping the underlying key (YYYY-MM) for uniqueness while simplifying the label.
function monthLabel(key) {
  try { return new Date(`${key}-01T00:00:00`).toLocaleString(undefined, { month: 'short' }); } catch { return key; }
}

export function buildMonthlyDatasets(trips = [], refuels = []) {
  const monthData = {};

  // From refuels: liters & cost & avg price
  for (const r of refuels) {
    const key = monthKey(r.createdAt); if (!key) continue;
    (monthData[key] ||= { liters:0, fuelCost:0, priceTotal:0, priceCount:0, distance:0 });
    monthData[key].liters += safeNum(r.liters);
    const cost = safeNum(r.totalCost);
    if (cost > 0) monthData[key].fuelCost += cost; else {
      // fallback: pricePerLiter * liters
      monthData[key].fuelCost += safeNum(r.pricePerLiter) * safeNum(r.liters);
    }
    const ppl = safeNum(r.pricePerLiter);
    if (ppl > 0) { monthData[key].priceTotal += ppl; monthData[key].priceCount += 1; }
  }
  // From trips: distance (and ensure we have month bucket) & cost fallback
  for (const t of trips) {
    const key = monthKey(t.createdAt); if (!key) continue;
    (monthData[key] ||= { liters:0, fuelCost:0, priceTotal:0, priceCount:0, distance:0 });
    monthData[key].distance += safeNum(t.distanceKm);
    if (!monthData[key].fuelCost && safeNum(t.fuelCost) > 0) monthData[key].fuelCost += safeNum(t.fuelCost);
  }

  const keys = sortMonthKeys(Object.keys(monthData));
  return keys.map(k => {
    const m = monthData[k];
    const avgPrice = m.priceCount > 0 ? m.priceTotal / m.priceCount : 0;
    return {
      key: k,
      label: monthLabel(k),
      liters: Number(m.liters.toFixed(2)),
      fuelCost: Number(m.fuelCost.toFixed(2)),
      avgPrice: Number(avgPrice.toFixed(2)),
      distance: Number(m.distance.toFixed(2)),
    };
  });
}

export function buildTripScatterData(trips = []) {
  return trips.map(t => ({
    id: t.id,
    distance: Number(safeNum(t.distanceKm).toFixed(2)),
    fuelCost: Number(safeNum(t.fuelCost).toFixed(2)),
    vehicle: t.vehicleLabel || '—',
  })).filter(p => p.distance > 0 && p.fuelCost > 0);
}

export function buildFrequentRoutes(trips = [], limit = 10) {
  const counts = {};
  for (const t of trips) {
    const start = t.startLocationName || t.startName || 'Start?';
    const end = t.endLocationName || t.endName || 'End?';
    const key = `${start}||${end}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([k,c]) => { const [start, end] = k.split('||'); return { start, end, count: c }; })
    .sort((a,b) => b.count - a.count)
    .slice(0, limit);
}

// Daily activity map for calendar highlighting.
// Returns { 'YYYY-MM-DD': { trips:[...], refuels:[...] } }
export function buildDailyActivity(trips = [], refuels = []) {
  const days = {};
  const add = (iso, type, obj) => {
    if (!iso) return; const d = new Date(iso); if (isNaN(d)) return;
    const key = d.toISOString().slice(0,10); // UTC date part ok for highlighting; adjust if local needed
    (days[key] ||= { trips: [], refuels: [] });
    days[key][type].push(obj);
  };
  trips.forEach(t => add(t.createdAt, 'trips', t));
  refuels.forEach(r => add(r.createdAt, 'refuels', r));
  return days;
}
