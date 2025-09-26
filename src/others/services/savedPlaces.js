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

export async function listSavedPlaces() {
  try {
    const data = await fetchJSON(`${API_BASE}/saved_places_list.php`, { method: 'GET' });
    return Array.isArray(data?.items) ? data.items : [];
  } catch (e) {
    console.warn('listSavedPlaces failed:', e);
    return [];
  }
}

export async function addSavedPlace({ name, latitude, longitude }) {
  const body = toForm({ name, latitude, longitude });
  const data = await fetchJSON(`${API_BASE}/saved_places_add.php`, { method: 'POST', body });
  return data.place || null;
}

export async function deleteSavedPlace(id) {
  const body = toForm({ id });
  const data = await fetchJSON(`${API_BASE}/saved_places_delete.php`, { method: 'POST', body });
  return !!data.deleted;
}
