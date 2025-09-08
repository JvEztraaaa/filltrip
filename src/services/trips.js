// Lightweight localStorage-backed trips service for easy backend swap later
const STORAGE_KEY = 'filltrip_trips_v1';

function safeRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeWrite(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function listTrips() {
  return safeRead();
}

export function clearTrips() {
  safeWrite([]);
}

function makeSignature(t) {
  return [t.startName||'', t.endName||'', t.distanceKm||'', t.litersNeeded||'', t.fuelCost||'', t.fuelType||'', t.vehicleLabel||''].join('|');
}

export function addTrip(trip) {
  const nowIso = new Date().toISOString();
  const full = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
    createdAt: nowIso,
    ...trip,
  };
  const list = safeRead();
  // De-dupe identical consecutive trip within 15s
  const last = list[0];
  if (last) {
    const lastSig = makeSignature(last);
    const currSig = makeSignature(full);
    const dt = Math.abs(new Date(nowIso) - new Date(last.createdAt));
    if (lastSig === currSig && dt < 15000) {
      return { added: false, trip: last };
    }
  }
  list.unshift(full);
  // Cap to 500 for safety
  if (list.length > 500) list.pop();
  safeWrite(list);
  return { added: true, trip: full };
}

export function groupTripsByMonth(trips) {
  const groups = {};
  trips.forEach(t => {
    const d = new Date(t.createdAt);
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  // Sort groups desc by key, and each group by date desc
  const orderedKeys = Object.keys(groups).sort((a,b) => b.localeCompare(a));
  return orderedKeys.map(k => ({ key: k, label: new Date(k+'-01T00:00:00').toLocaleString(undefined, { month: 'long', year: 'numeric' }), items: groups[k].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) }));
}

export function getTrip(id) {
  const list = safeRead();
  return list.find(t => t.id === id) || null;
}

export function deleteTrip(id) {
  const list = safeRead();
  const next = list.filter(t => t.id !== id);
  safeWrite(next);
  return { ok: next.length !== list.length };
}

export function updateTrip(id, patch) {
  const list = safeRead();
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return { ok: false };
  const updated = { ...list[idx], ...patch };
  // normalize number fields if provided as strings
  ['distanceKm','litersNeeded','fuelCost'].forEach(k => {
    if (updated[k] !== undefined) {
      const n = typeof updated[k] === 'string' ? parseFloat(updated[k]) : updated[k];
      if (!Number.isNaN(n)) updated[k] = n;
    }
  });
  list[idx] = updated;
  safeWrite(list);
  return { ok: true, trip: updated };
}
