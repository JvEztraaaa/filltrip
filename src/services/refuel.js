// LocalStorage-backed Refuel History service
const STORAGE_KEY = 'filltrip_refuels_v1';

function safeRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function safeWrite(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export function listRefuels() {
  const items = safeRead();
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addRefuel(entry) {
  const nowIso = new Date().toISOString();
  const e = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: entry.createdAt || nowIso,
    odometerKm: Number(entry.odometerKm ?? 0) || 0,
    liters: Number(entry.liters ?? 0) || 0,
    pricePerLiter: Number(entry.pricePerLiter ?? 0) || 0,
    totalCost: Number(entry.totalCost ?? (Number(entry.liters || 0) * Number(entry.pricePerLiter || 0))) || 0,
    fuelType: entry.fuelType || 'Gasoline / Unleaded (91)',
    station: entry.station || '',
    currency: entry.currency || 'PHP',
  };
  const all = safeRead();
  all.push(e);
  safeWrite(all);
  return e;
}

export function updateRefuel(id, updates) {
  const all = safeRead();
  const idx = all.findIndex(x => x.id === id);
  if (idx === -1) return false;
  const cur = all[idx];
  const u = { ...updates };
  if ('odometerKm' in u) u.odometerKm = Number(u.odometerKm ?? 0) || 0;
  if ('liters' in u) u.liters = Number(u.liters ?? 0) || 0;
  if ('pricePerLiter' in u) u.pricePerLiter = Number(u.pricePerLiter ?? 0) || 0;
  if ('totalCost' in u) u.totalCost = Number(u.totalCost ?? (u.liters * u.pricePerLiter)) || 0;
  all[idx] = { ...cur, ...u };
  safeWrite(all);
  return true;
}

export function deleteRefuel(id) {
  const all = safeRead();
  const next = all.filter(x => x.id !== id);
  safeWrite(next);
}

export function groupRefuelsByMonth(items) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
  const groups = new Map();
  items.forEach(i => {
    const d = new Date(i.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = fmt.format(d);
    if (!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key).items.push(i);
  });
  return Array.from(groups.values()).sort((a,b)=>a.key<b.key?1:-1);
}

export function computeDistanceSincePrev(sortedByDateAsc) {
  // Returns map: id -> distance since previous entry, based on odometer
  let prevOdo = null;
  const map = new Map();
  sortedByDateAsc.forEach(i => {
    if (prevOdo == null) {
      map.set(i.id, null);
      prevOdo = i.odometerKm;
      return;
    }
    const dist = (Number(i.odometerKm) || 0) - (Number(prevOdo) || 0);
    map.set(i.id, dist >= 0 ? Number(dist.toFixed(2)) : null);
    prevOdo = i.odometerKm;
  });
  return map;
}
