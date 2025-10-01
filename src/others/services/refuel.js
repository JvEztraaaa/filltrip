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

export async function listRefuels() {
  try {
    const data = await fetchJSON(`${API_BASE}/refuel_list.php`, { method: 'GET' });
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.error('listRefuels failed:', e);
    return [];
  }
}

export async function addRefuel(entry) {
  const payload = {
    createdAt:      entry.createdAt,         
    vehicleName:    entry.vehicleName,
    odometerKm:     entry.odometerKm,
    distanceUnit:   entry.distanceUnit || 'km',
    liters:         entry.liters,
    fuelUnit:       entry.fuelUnit || 'liters',
    pricePerLiter:  entry.pricePerLiter,
    totalCost:      entry.totalCost,         
    fuelType:       entry.fuelType || 'Gasoline / Unleaded (91)',
    station:        entry.station || '',
    currency:       entry.currency || 'PHP',
  };
  const data = await fetchJSON(`${API_BASE}/refuel_add.php`, {
    method: 'POST',
    body: toForm(payload),
  });
  return data.entry;
}

export async function updateRefuel(id, updates) {
  const payload = { id,
    createdAt:     updates.createdAt,
    vehicleName:   updates.vehicleName,
    odometerKm:    updates.odometerKm,
    distanceUnit:  updates.distanceUnit,
    liters:        updates.liters,
    fuelUnit:      updates.fuelUnit,
    pricePerLiter: updates.pricePerLiter,
    totalCost:     updates.totalCost,
    fuelType:      updates.fuelType,
    station:       updates.station,
    currency:      updates.currency,
  };
  const data = await fetchJSON(`${API_BASE}/refuel_update.php`, {
    method: 'POST',
    body: toForm(payload),
  });
  return { ok: !!data.updated };
}

export async function deleteRefuel(id) {
  const data = await fetchJSON(`${API_BASE}/refuel_delete.php`, {
    method: 'POST',
    body: toForm({ id }),
  });
  return { ok: !!data.deleted };
}

export function groupRefuelsByMonth(items) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
  const groups = new Map();
  (Array.isArray(items) ? items : []).forEach(i => {
    const d = new Date(i.createdAt);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = fmt.format(d);
    if (!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key).items.push(i);
  });
  return Array.from(groups.values()).sort((a,b)=>a.key<b.key?1:-1);
}