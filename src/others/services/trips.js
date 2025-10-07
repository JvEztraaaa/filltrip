const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost/filltrip-db';

function toForm(obj) {
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) p.append(k, String(v));
  });
  return p;
}

async function fetchJSON(url, init = {}) {
  const res = await fetch(url, { credentials: 'include', ...init });
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch {}
  if (!res.ok || data?.success === false) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status; err.data = data; throw err;
  }
  return data;
}

export async function listTrips() {
  try {
    const data = await fetchJSON(`${API_BASE}/trips_list.php`, { method: 'GET' });
    const arr = Array.isArray(data?.trips) ? data.trips : [];
    return arr;
  } catch (e) {
    console.error('listTrips failed:', e);
    return [];
  }
}

export function groupTripsByMonth(input) {
  const trips = Array.isArray(input)
    ? input
    : (Array.isArray(input?.trips) ? input.trips : []);

  const groups = {};
  for (const t of trips) {
    const d = new Date(t.createdAt);
    if (isNaN(d)) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    (groups[key] ||= []).push(t);
  }
  const ordered = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  return ordered.map(k => ({
    key: k,
    label: new Date(`${k}-01T00:00:00`).toLocaleString(undefined, { month: 'long', year: 'numeric' }),
    items: groups[k].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  }));
}

export async function addTrip(trip) {
  const payload = {
    startLocationName: trip.startLocationName ?? trip.startName ?? '',
    endLocationName:   trip.endLocationName   ?? trip.endName   ?? '',
    distanceKm:   trip.distanceKm,
    efficiencyKmPerL: trip.efficiencyKmPerL ?? trip.efficiency ?? '',
    pricePerLiter:    trip.pricePerLiter ?? trip.fuelPricePerLiter ?? '',
    litersNeeded:     trip.litersNeeded ?? '',
    fuelCost:         trip.fuelCost ?? '',
    currency:         trip.currency || 'PHP',
    fuelType:         trip.fuelType || '',
    vehicleLabel:     trip.vehicleLabel || trip.vehicle || '',
  };
  try {
    const data = await fetchJSON(`${API_BASE}/trips_add.php`, {
      method: 'POST',
      body: toForm(payload),
    });
    return { added: true, trip: data.trip };
  } catch (e) {
    console.error('addTrip failed payload=', payload, e);
    throw e;
  }
}

export async function deleteTrip(id) {
  const data = await fetchJSON(`${API_BASE}/trips_delete.php`, {
    method: 'POST',
    body: toForm({ id }),
  });
  return { ok: !!data.deleted };
}

export function clearTrips() {}
export function getTrip() { return null; }
export function updateTrip() { return { ok: false }; }