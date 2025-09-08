import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapPage.css";
import Header from "../../components/Header";
import SidePanel from "../../components/SidePanel";

const MapPage = () => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [routeDistanceKm, setRouteDistanceKm] = useState(null);
  const [isDarkStyle, setIsDarkStyle] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: "map",
      style: isDarkStyle ? "mapbox://styles/mapbox/dark-v10" : "mapbox://styles/mapbox/streets-v11",
      center: [121.774, 12.8797],
      zoom: 5.5,
    });
    mapRef.current = map;

    let startCoords = null,
      endCoords = null,
      startMarker = null,
      endMarker = null,
      currentRouteCoords = null;

    const startLabel = document.getElementById("start-label");
    const endLabel = document.getElementById("end-label");
    const distanceEl = document.getElementById("distance");
    const durationEl = document.getElementById("duration");
    const stepsEl = document.getElementById("steps");
    const stepsCard = document.getElementById("stepsCard");
    const sidebar = document.getElementById("sidebar");
    const locateBtnMobile = document.getElementById("locateBtnMobile");
    const toggleSidebarMobile = document.getElementById("toggleSidebarMobile");

    const emptyLine = () => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: [] },
    });

    function truncateLabel(text, max = 60) {
      if (!text) return '';
      return text.length > max ? text.slice(0, max - 3) + '...' : text;
    }

    function setStart(coords, label) {
      startCoords = coords;
      if (startMarker) startMarker.remove();
      startMarker = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat(coords)
        .addTo(map);
      startLabel.textContent = 'Start: ' + truncateLabel(label);
      startLabel.setAttribute('title', 'Start: ' + label);
      updateRoute();
    }

    function setEnd(coords, label) {
      endCoords = coords;
      if (endMarker) endMarker.remove();
      endMarker = new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(coords)
        .addTo(map);
      endLabel.textContent = 'End: ' + truncateLabel(label);
      endLabel.setAttribute('title', 'End: ' + label);
      updateRoute();
    }

    async function nominatimSearch(query) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ph&q=${encodeURIComponent(
        query
      )}`;
      const r = await fetch(url, { headers: { "Accept-Language": "en" } });
      return r.json();
    }

    const activeControllers = new Set();
    function attachSearch(inputEl, suggestionsEl, onSelect) {
      let debounceTimer = null;
      let lastQuery = "";
      let lockedAfterSelect = false;

      const hideSuggestions = () => {
        suggestionsEl.classList.add("hidden");
      };
      const showSuggestions = () => {
        suggestionsEl.classList.remove("hidden");
      };

      async function runSearch(q) {
        activeControllers.forEach((c) => c.abort());
        activeControllers.clear();
        const controller = new AbortController();
        activeControllers.add(controller);
        try {
          const results = await nominatimSearch(q);
          if (controller.signal.aborted) return;
          suggestionsEl.innerHTML = "";
          if (!results.length) {
            hideSuggestions();
            return;
          }
          results.forEach((r) => {
            const div = document.createElement("div");
            div.textContent = r.display_name;
            div.className = "px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-700 last:border-0";
            div.addEventListener("click", () => {
              lockedAfterSelect = true;
              inputEl.value = r.display_name;
              onSelect([parseFloat(r.lon), parseFloat(r.lat)], r.display_name);
              hideSuggestions();
              inputEl.blur();
            });
            suggestionsEl.appendChild(div);
          });
          showSuggestions();
        } catch (e) {
        } finally {
          activeControllers.delete(controller);
        }
      }

      const inputHandler = () => {
        const q = inputEl.value.trim();
        if (lockedAfterSelect) {
          lockedAfterSelect = false;
        }
        if (!q || q.length < 3) {
          hideSuggestions();
          lastQuery = q;
          return;
        }
        if (q === lastQuery) return;
        lastQuery = q;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => runSearch(q), 450);
      };

      inputEl.addEventListener("input", inputHandler);
      const outsideClick = (e) => {
        if (!suggestionsEl.contains(e.target) && e.target !== inputEl) {
          hideSuggestions();
        }
      };
      document.addEventListener("mousedown", outsideClick);

      return () => {
        inputEl.removeEventListener("input", inputHandler);
        document.removeEventListener("mousedown", outsideClick);
        clearTimeout(debounceTimer);
      };
    }

    async function updateRoute() {
      if (!startCoords || !endCoords) return;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;
      const r = await fetch(url);
      const j = await r.json();
      if (!j.routes?.length) return;

      const route = j.routes[0];
      const coords = route.geometry.coordinates;
      currentRouteCoords = coords;
      if (fuelLayerVisible) {
        removeFuelLayer();
        const fb = document.getElementById('fuelBtn');
        if (fb) {
          const labelSpan = fb.querySelector('.label');
          if (labelSpan) labelSpan.textContent = 'Show Gas';
        }
        fuelDataCache = null;
      }
      const distKm = route.distance / 1000;
      distanceEl.textContent = distKm.toFixed(2) + " km";
      setRouteDistanceKm(distKm);
      durationEl.textContent = Math.round(route.duration / 60) + " min";

      stepsEl.innerHTML = "";
      route.legs[0]?.steps?.forEach((s) => {
        const li = document.createElement("li");
        li.className = "text-xs text-gray-300 py-1 pl-1";
        li.textContent = s.maneuver.instruction;
        stepsEl.appendChild(li);
      });
      stepsCard.style.display = route.legs[0]?.steps?.length ? "block" : "none";

      if (map.getSource("route")) {
        map.getSource("route").setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
        });
      } else {
        map.addSource("route", {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#4FD1C5",
            "line-width": 5,
            "line-opacity": 0.9
          },
          layout: {
            "line-cap": "round",
            "line-join": "round"
          }
        });
      }

      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, {
        padding: { top: 60, left: 40, right: document.getElementById("sidebar").classList.contains("closed-true") ? 40 : 380, bottom: 60 },
      });
    }

    // --- Event bindings ---
    const cleanups = [];
    cleanups.push(
      attachSearch(
        document.getElementById("searchStart"),
        document.getElementById("suggestionsStart"),
        setStart
      )
    );
    cleanups.push(
      attachSearch(
        document.getElementById("searchEnd"),
        document.getElementById("suggestionsEnd"),
        setEnd
      )
    );

    map.on("click", (e) => {
      const selectedModeEl = document.querySelector("input[name=pickMode]:checked");
      const selectedMode = selectedModeEl ? selectedModeEl.value : 'end';
      const coords = [e.lngLat.lng, e.lngLat.lat];
      const label = `Dropped pin (${coords[1].toFixed(4)},${coords[0].toFixed(4)})`;

      if (!startCoords) {
        setStart(coords, label);
        return;
      }
      if (!endCoords) {
        setEnd(coords, label);
        return;
      }
      if (selectedMode === 'start') setStart(coords, label); else setEnd(coords, label);
    });

    document.getElementById("clearBtn").addEventListener("click", () => {
      if (startMarker) startMarker.remove();
      if (endMarker) endMarker.remove();
      startMarker = endMarker = null;
      startCoords = endCoords = null;
      startLabel.textContent = "Start: (none)";
      endLabel.textContent = "End: (none)";
      distanceEl.textContent = "--";
      durationEl.textContent = "--";
      stepsCard.style.display = "none";
      stepsEl.innerHTML = "";
      document.getElementById("searchStart").value = "";
      document.getElementById("searchEnd").value = "";
      if (map.getSource("route")) map.getSource("route").setData(emptyLine());
      setRouteDistanceKm(null);
    });

    document.getElementById("swapBtn").addEventListener("click", () => {
      [startCoords, endCoords] = [endCoords, startCoords];
      [startMarker, endMarker] = [endMarker, startMarker];
      const tmpText = startLabel.textContent;
      const tmpTitle = startLabel.getAttribute('title');
      startLabel.textContent = endLabel.textContent;
      startLabel.setAttribute('title', endLabel.getAttribute('title'));
      endLabel.textContent = tmpText;
      endLabel.setAttribute('title', tmpTitle);
      updateRoute();
    });

    const handleLocate = () => {
      if (!navigator.geolocation) return alert("Geolocation is not supported by your browser");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setStart(coords, "My location");
          map.easeTo({ center: coords, zoom: 14 });
        },
        (err) => alert("Unable to get your location: " + err.message),
        { enableHighAccuracy: true }
      );
    };

    document.getElementById("locateBtn").addEventListener("click", handleLocate);

    if (locateBtnMobile) {
      locateBtnMobile.addEventListener("click", handleLocate);
    }

    if (toggleSidebarMobile) {
      toggleSidebarMobile.addEventListener("click", () => {
        sidebar.classList.toggle("closed");
      });
    }

    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currWidth = window.innerWidth;
      if (prevWidth >= 768 && currWidth < 768 && !sidebar.classList.contains("closed")) {
        sidebar.classList.add("closed");
      }
      prevWidth = currWidth;
    };
    window.addEventListener("resize", handleResize);

    // --- Fuel (gasoline) stations toggle logic using Overpass / OpenStreetMap ---
    let fuelLayerVisible = false;
    let fuelDataCache = null;
    let fuelLoading = false;
    let fuelAbortController = null;
    const routeFuelCache = new Map();

    function routeKey() {
      if (!currentRouteCoords || currentRouteCoords.length < 2) return null;
      const a = currentRouteCoords[0];
      const b = currentRouteCoords[currentRouteCoords.length - 1];
      return `${a[0].toFixed(4)},${a[1].toFixed(4)}-${b[0].toFixed(4)},${b[1].toFixed(4)}`;
    }

    function showFuelError(msg) {
      const el = document.getElementById('fuelError');
      if (!el) {
        alert(msg);
        return;
      }
      el.textContent = msg;
      el.classList.remove('hidden');
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(() => {
        el.classList.add('hidden');
      }, 3000);
    }

    function hideFuelError() {
      const el = document.getElementById('fuelError');
      if (el) el.classList.add('hidden');
    }

    async function fetchFuelStations() {
      if (!currentRouteCoords || currentRouteCoords.length < 2) return null;
      const key = routeKey();
      if (key && routeFuelCache.has(key)) {
        fuelDataCache = routeFuelCache.get(key);
        return;
      }

      const totalPts = currentRouteCoords.length;
      const sampleCount = Math.min(14, Math.max(6, Math.floor(totalPts / 10)));
      const step = Math.max(1, Math.floor(totalPts / sampleCount));
      const samples = [];
      for (let i = 0; i < totalPts; i += step) samples.push(currentRouteCoords[i]);
      if (samples[samples.length - 1] !== currentRouteCoords[totalPts - 1]) samples.push(currentRouteCoords[totalPts - 1]);

      const routeLengthApproxKm = (() => {
        let d = 0;
        for (let i = 1; i < currentRouteCoords.length; i++) {
          const [x1, y1] = currentRouteCoords[i - 1];
          const [x2, y2] = currentRouteCoords[i];
          const dx = (x2 - x1) * 111.32 * Math.cos(((y1 + y2) / 2) * Math.PI / 180);
          const dy = (y2 - y1) * 110.57;
          d += Math.sqrt(dx * dx + dy * dy);
        }
        return d;
      })();
      const baseRadius = routeLengthApproxKm < 30 ? 3000 : routeLengthApproxKm < 120 ? 5000 : 8000; // meters

      const overpassEndpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ];

      const collected = new Map(); // id -> feature
      fuelAbortController = new AbortController();

      const statusEl = document.getElementById('fuelStatus');
      const setStatus = (t) => { if (statusEl) { statusEl.textContent = t; statusEl.classList.remove('hidden'); } };
      setStatus('Fetching stations 0%');

      for (let idx = 0; idx < samples.length; idx++) {
        if (fuelAbortController.signal.aborted) throw new Error('aborted');
        const pt = samples[idx];
        const radius = baseRadius;
        const body = `[out:json][timeout:20];(node["amenity"="fuel"](around:${radius},${pt[1]},${pt[0]}););out body;`;
        let success = false;
        for (const endpoint of overpassEndpoints) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 20000);
            const res = await fetch(`${endpoint}?data=${encodeURIComponent(body)}`, { signal: controller.signal, headers: { 'Accept-Language': 'en' } });
            clearTimeout(timer);
            if (!res.ok) continue;
            const json = await res.json();
            (json.elements || []).forEach(el => {
              if (el.type === 'node' && el.tags) {
                if (!collected.has(el.id)) {
                  collected.set(el.id, {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
                    properties: {
                      id: el.id,
                      name: el.tags.name || 'Fuel Station',
                      brand: el.tags.brand || '',
                      operator: el.tags.operator || ''
                    }
                  });
                }
              }
            });
            success = true;
            break;
          } catch (e) {
          }
        }
        const pct = Math.round(((idx + 1) / samples.length) * 100);
        setStatus(`Fetching stations ${pct}%`);
        if (!success) {
        }
      }
      if (statusEl) setTimeout(() => statusEl.classList.add('hidden'), 1200);
      fuelDataCache = { type: 'FeatureCollection', features: Array.from(collected.values()) };
      if (key) routeFuelCache.set(key, fuelDataCache);
    }

    function addFuelLayer() {
      if (!fuelDataCache) return;
      if (map.getSource('fuel-stations')) {
        map.getSource('fuel-stations').setData(fuelDataCache);
      } else {
        map.addSource('fuel-stations', { type: 'geojson', data: fuelDataCache });

        map.addLayer({
          id: 'fuel-stations-glow',
          type: 'circle',
          source: 'fuel-stations',
          paint: {
            'circle-radius': ["interpolate", ["linear"], ["zoom"], 5, 6, 10, 10, 14, 14],
            'circle-color': '#f59e0b',
            'circle-opacity': 0.9,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-blur': 0.15
          }
        });

        map.addLayer({
          id: 'fuel-stations-layer',
          type: 'symbol',
          source: 'fuel-stations',
          layout: {
            'icon-image': 'fuel-15',
            'icon-size': 1.6,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-offset': [0, 2.1],
            'text-anchor': 'top',
            'text-size': 12,
            'text-optional': true,
            'text-allow-overlap': false
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1.2
          }
        });

        map.on('click', 'fuel-stations-layer', (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const { name, brand, operator } = f.properties || {};
          const html = `<div class=\"text-sm\"><div class=\"font-semibold mb-1\">${name || 'Fuel Station'}</div>${brand ? `<div>Brand: ${brand}</div>` : ''}${operator ? `<div>Operator: ${operator}</div>` : ''}</div>`;
          new mapboxgl.Popup({ closeButton: true })
            .setLngLat(f.geometry.coordinates)
            .setHTML(html)
            .addTo(map);
        });
        map.on('mouseenter', 'fuel-stations-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'fuel-stations-layer', () => { map.getCanvas().style.cursor = ''; });
      }
      fuelLayerVisible = true;
    }

    function removeFuelLayer() {
      if (map.getLayer('fuel-stations-layer')) map.removeLayer('fuel-stations-layer');
      if (map.getLayer('fuel-stations-glow')) map.removeLayer('fuel-stations-glow');
      if (map.getSource('fuel-stations')) map.removeSource('fuel-stations');
      fuelLayerVisible = false;
    }

    map.on('style.load', () => {
      if (fuelLayerVisible && fuelDataCache) {
        addFuelLayer();
      }
      if (currentRouteCoords && currentRouteCoords.length) {
        if (!map.getSource('route')) {
          map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: currentRouteCoords } }
          });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            paint: {
              'line-color': '#4FD1C5',
              'line-width': 5,
              'line-opacity': 0.9
            },
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            }
          });
        } else {
          map.getSource('route').setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: currentRouteCoords }
          });
        }
      }
    });

    const fuelBtn = document.getElementById('fuelBtn');
    if (fuelBtn) {
      fuelBtn.addEventListener('click', async () => {
        if (fuelLoading) {
          fuelAbortController?.abort();
          showFuelError('Cancelled fuel fetch.');
          fuelLoading = false;
          fuelBtn.querySelector('.label').textContent = 'Show Gas';
          return;
        }
        if (!fuelLayerVisible) {
          if (!startCoords || !endCoords || !currentRouteCoords) {
            showFuelError('Please select your start and end locations first.');
            return;
          }
          hideFuelError();
          fuelBtn.disabled = true;
          fuelBtn.querySelector('.label').textContent = 'Loading...';
          fuelLoading = true;
          try {
            await fetchFuelStations();
            if (!fuelDataCache || !fuelDataCache.features.length) {
              fuelBtn.querySelector('.label').textContent = 'Show Gas';
              showFuelError('No fuel stations found (try zooming in or another area).');
            } else {
              addFuelLayer();
              fuelBtn.querySelector('.label').textContent = 'Hide Gas';
              hideFuelError();
            }
          } catch (err) {
            fuelBtn.querySelector('.label').textContent = 'Show Gas';
            if (String(err).includes('aborted')) {
            } else if (String(err).includes('504') || String(err).includes('Failed to fetch')) {
              showFuelError('Fuel station service timeout. Please click again.');
            } else {
              showFuelError('Failed to load fuel stations. Try again.');
            }
          } finally {
            fuelBtn.disabled = false;
            fuelLoading = false;
          }
        } else {
          removeFuelLayer();
          fuelBtn.querySelector('.label').textContent = 'Show Gas';
          hideFuelError();
        }
      });
    }

    // --- Saved Places Feature ---
    const STORAGE_KEY = 'filltrip_saved_places_v1';
    let savedPlaces = [];
    const savedBtn = document.getElementById('savedPlacesBtn');
    const savedPanel = document.getElementById('savedPlacesPanel');
    const savedList = document.getElementById('savedPlacesList');
    const saveStartBtn = document.getElementById('saveStartBtn');
    const saveEndBtn = document.getElementById('saveEndBtn');
    // Removed center save button per request
    const savedToast = document.getElementById('savedPlacesToast');

    function toast(msg) {
      if (!savedToast) return;
      savedToast.textContent = msg;
      savedToast.classList.remove('opacity-0', 'translate-y-2');
      clearTimeout(savedToast._hideTimer);
      savedToast._hideTimer = setTimeout(() => {
        savedToast.classList.add('opacity-0', 'translate-y-2');
      }, 2200);
    }

    function loadSaved() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) savedPlaces = JSON.parse(raw);
      } catch {
        savedPlaces = [];
      }
    }
    function persistSaved() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlaces));
    }
    function renderSaved() {
      if (!savedList) return;
      savedList.innerHTML = '';
      if (!savedPlaces.length) {
        const empty = document.createElement('div');
        empty.className = 'text-xs text-gray-400 py-4 text-center';
        empty.textContent = 'No saved places yet.';
        savedList.appendChild(empty);
        return;
      }
      savedPlaces.forEach(p => {
        const row = document.createElement('div');
        row.className = 'flex items-start gap-2 py-2 border-b border-gray-800 last:border-0';
        row.innerHTML = `
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">${p.name}</div>
            <div class="text-[10px] text-gray-400">${p.coords[1].toFixed(4)}, ${p.coords[0].toFixed(4)}</div>
          </div>
          <div class="flex items-center gap-1">
            <button data-action="use-start" data-id="${p.id}" class="px-2 py-1 rounded bg-teal-600 hover:bg-teal-500 text-[10px] text-white">Start</button>
            <button data-action="use-end" data-id="${p.id}" class="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white">End</button>
            <button data-action="delete" data-id="${p.id}" class="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-[10px] text-white">Del</button>
          </div>`;
        savedList.appendChild(row);
      });
    }
    function addSaved(name, coords) {
      if (!coords) return toast('No coordinates to save.');
      const exists = savedPlaces.some(p => p.name === name || (p.coords[0] === coords[0] && p.coords[1] === coords[1]));
      if (exists) return toast('Already saved.');
      savedPlaces.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), name, coords });
      if (savedPlaces.length > 100) savedPlaces.pop();
      persistSaved();
      renderSaved();
      toast('Place saved');
    }

    loadSaved();
    renderSaved();

    if (saveStartBtn) {
      saveStartBtn.addEventListener('click', () => {
        if (!startCoords) return toast('No start selected');
        const raw = (document.getElementById('searchStart').value || '').trim();
        const name = raw || `${startCoords[1].toFixed(4)}, ${startCoords[0].toFixed(4)}`;
        addSaved(name, startCoords.slice());
      });
    }
    if (saveEndBtn) {
      saveEndBtn.addEventListener('click', () => {
        if (!endCoords) return toast('No end selected');
        const raw = (document.getElementById('searchEnd').value || '').trim();
        const name = raw || `${endCoords[1].toFixed(4)}, ${endCoords[0].toFixed(4)}`;
        addSaved(name, endCoords.slice());
      });
    }

    if (savedList) {
      savedList.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const place = savedPlaces.find(p => p.id === id);
        if (!place) return;
        const action = btn.getAttribute('data-action');
        if (action === 'delete') {
          savedPlaces = savedPlaces.filter(p => p.id !== id);
          persistSaved();
          renderSaved();
          toast('Deleted');
        } else if (action === 'use-start') {
          setStart(place.coords.slice(), place.name);
          toast('Set as start');
        } else if (action === 'use-end') {
          setEnd(place.coords.slice(), place.name);
          toast('Set as end');
        }
      });
    }

    function closeSavedPanel() {
      if (savedPanel && !savedPanel.classList.contains('hidden')) savedPanel.classList.add('hidden');
    }

    const escKeyHandler = (e) => {
      if (e.key === 'Escape' && savedPanel && !savedPanel.classList.contains('hidden')) {
        savedPanel.classList.add('hidden');
      }
    };
    document.addEventListener('keydown', escKeyHandler);

    const outsideHandler = (e) => {
      if (!savedPanel || savedPanel.classList.contains('hidden')) return;
      if (savedPanel.contains(e.target) || (savedBtn && savedBtn.contains(e.target))) return;
      savedPanel.classList.add('hidden');
    };
    document.addEventListener('mousedown', outsideHandler);
    document.addEventListener('touchstart', outsideHandler, { passive: true });

    if (fuelBtn) {
      fuelBtn.addEventListener('click', () => closeSavedPanel());
    }

    return () => {
      map.remove();
      cleanups.forEach((fn) => fn && fn());
      window.removeEventListener("resize", handleResize);
      if (locateBtnMobile) {
        locateBtnMobile.removeEventListener("click", handleLocate);
      }
      document.removeEventListener('keydown', escKeyHandler);
      document.removeEventListener('mousedown', outsideHandler);
      document.removeEventListener('touchstart', outsideHandler);
    };
  }, []);

  // Toggle between light and dark map styles
  const toggleStyle = () => {
    const sp = document.getElementById('savedPlacesPanel');
    if (sp && !sp.classList.contains('hidden')) sp.classList.add('hidden');
    const newStyle = isDarkStyle
      ? "mapbox://styles/mapbox/streets-v11"
      : "mapbox://styles/mapbox/dark-v10";
    if (mapRef.current) {
      mapRef.current.setStyle(newStyle);
    }
    setIsDarkStyle(prev => !prev);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const sp = document.getElementById('savedPlacesPanel');
    if (sp && !sp.classList.contains('hidden')) sp.classList.add('hidden');
    setIsSidebarOpen(prev => !prev);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 350);
  };

  return (
    <div className="relative h-screen w-screen bg-gray-900 overflow-hidden">
      { }
      <SidePanel />

      { }
      <div id="map" className="absolute inset-0 h-full w-full z-0" />

      { }
      <Header />      { }
      { }
      <button
        onClick={toggleSidebar}
        className="fixed top-16 right-4 z-[55] bg-gray-800 hover:bg-gray-700 p-3 rounded-md shadow-lg flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
        aria-label="Toggle route sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Dark theme toggle */}
      <button
        onClick={toggleStyle}
        className="fixed right-4 z-[55] bg-gray-800 hover:bg-gray-700 p-3 rounded-md shadow-lg flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
        aria-label="Toggle map style"
        style={{ top: '120px' }}
      >
        {isDarkStyle ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>

      {/* Fuel stations toggle button */}
      <button
        id="fuelBtn"
        className="fixed right-4 z-[55] bg-gray-800 hover:bg-gray-700 p-3 rounded-md shadow-lg flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
        aria-label="Show nearby gas stations"
        style={{ top: '176px', width: '48px', height: '48px' }}
      >
        { }
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
          <path d="M3 3h12v18H3z" />
          <path d="M16 8h1a4 4 0 0 1 4 4v6a2 2 0 0 1-2 2h-1" />
          <path d="M16 3v5" />
          <circle cx="7.5" cy="10.5" r="1.5" />
        </svg>
        <span className="label sr-only">Show Gas</span>
      </button>

      {/* Saved places toggle button */}
      <button
        id="savedPlacesBtn"
        onClick={() => { const panel = document.getElementById('savedPlacesPanel'); if (panel) panel.classList.toggle('hidden'); }}
        className="fixed right-4 z-[55] bg-gray-800 hover:bg-gray-700 p-3 rounded-md shadow-lg flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
        aria-label="Saved places"
        style={{ top: '232px', width: '48px', height: '48px' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
          <path d="M12 21s-6-5.686-6-11A6 6 0 0 1 12 4a6 6 0 0 1 6 6c0 5.314-6 11-6 11z" />
        </svg>
      </button>

      {/* Fuel error toast */}
      <div id="fuelError" className="hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-red-600/90 backdrop-blur px-4 py-2 rounded shadow-lg text-white text-sm font-medium max-w-xs text-center"></div>
      {/* Fuel status toast (progress) */}
      <div id="fuelStatus" className="hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] bg-gray-800/90 backdrop-blur px-4 py-2 rounded shadow-lg text-white text-xs font-medium max-w-xs text-center"></div>

      {/* Saved places panel */}
      <div
        id="savedPlacesPanel"
        className="hidden fixed z-[65] bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl text-white w-[280px] max-h-[60vh] overflow-hidden flex flex-col right-4 top-[288px] md:top-[288px]"
      >
        <div className="p-3 border-b border-gray-800 flex items-center justify-between">
          <div className="text-sm font-semibold">Saved Places</div>
          <div className="flex gap-1">
            <button id="saveStartBtn" className="px-2 py-1 text-[10px] bg-teal-600 hover:bg-teal-500 rounded cursor-pointer">Save Start</button>
            <button id="saveEndBtn" className="px-2 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 rounded cursor-pointer">Save End</button>
          </div>
        </div>
        <div id="savedPlacesList" className="flex-1 overflow-y-auto px-3 pb-2 text-xs"></div>
        <div className="p-2 text-[10px] text-gray-400 border-t border-gray-800 bg-gray-900/80">Tap a place to set Start/End.</div>
      </div>

      {/* Saved places toast */}
      <div id="savedPlacesToast" className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[70] bg-gray-800/90 text-white text-xs font-medium px-3 py-1 rounded shadow transition transform opacity-0 translate-y-2"></div>

      { }
      {isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed right-4 z-[65] bg-red-600 hover:bg-red-700 p-2 rounded-md shadow-lg flex items-center justify-center text-white transition-opacity duration-200 top-6 md:top-16 cursor-pointer"
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      { }
      <aside
        id="sidebar"
        className={`fixed top-0 right-0 h-full bg-gray-900 text-white p-4 overflow-y-auto transition-all duration-300 z-[60] w-full md:w-80 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} pt-12 md:pt-20 closed-${!isSidebarOpen}`}
      >
        { }
        { }
        { }
        <div className="pt-2 md:pt-5 mb-2"></div>

        { }
        <div className="mb-5 relative">
          <label htmlFor="searchStart" className="block text-xs font-medium text-gray-400 mb-1">Start Location</label>
          <input
            id="searchStart"
            className="w-full custom-input px-3 py-2 text-sm"
            placeholder="Enter starting point"
            autoComplete="off"
          />
          <div
            id="suggestionsStart"
            className="hidden absolute left-0 right-0 top-full mt-1 z-50 border border-gray-700 rounded-md bg-gray-800 text-white shadow-lg suggestions-box"
          />
          <div id="start-label" className="text-xs text-gray-400 mt-1">Start: (none)</div>
        </div>

        <div className="mb-5 relative">
          <label htmlFor="searchEnd" className="block text-xs font-medium text-gray-400 mb-1">End Location</label>
          <input
            id="searchEnd"
            className="w-full custom-input px-3 py-2 text-sm"
            placeholder="Enter destination"
            autoComplete="off"
          />
          <div
            id="suggestionsEnd"
            className="hidden absolute left-0 right-0 top-full mt-1 z-50 border border-gray-700 rounded-md bg-gray-800 text-white shadow-lg suggestions-box"
          />
          <div id="end-label" className="text-xs text-gray-400 mt-1">End: (none)</div>
        </div>

        { }
        <div className="grid grid-cols-2 gap-4 mb-3 bg-gray-800 rounded-lg p-3">
          <div className="text-center">
            <div id="distance" className="text-xl font-bold gradient-text">--</div>
            <div className="text-xs text-gray-400">Distance</div>
          </div>
          <div className="text-center">
            <div id="duration" className="text-xl font-bold gradient-text">--</div>
            <div className="text-xs text-gray-400">Duration</div>
          </div>
        </div>

        { }
        <div className="mb-7">
          <div className="flex gap-3 mb-5 bg-gray-800 rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="pickMode" value="start" defaultChecked className="accent-[#4FD1C5]" />
              <span>Pick Start</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="pickMode" value="end" className="accent-[#4FD1C5]" />
              <span>Pick End</span>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button id="swapBtn" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
              Swap
            </button>
            <button id="locateBtn" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
              Locate
            </button>
            <button id="clearBtn" className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-4 bg-gray-800/50 p-2 rounded border-l-2 border-[#4FD1C5]">
            <span className="font-medium text-[#4FD1C5]">Tip:</span> Search above or click map to set locations.
          </div>
        </div>

        { }
        <div id="stepsCard" className="hidden">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4FD1C5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="text-sm font-medium text-[#4FD1C5]">Turn-by-turn directions</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <ol id="steps" className="list-decimal list-inside text-sm max-h-60 overflow-y-auto space-y-2 pl-2"></ol>
          </div>
        </div>
      </aside>

      {/* Proceed button overlay on map (appears after both points chosen) */}
      {routeDistanceKm !== null && (
        <button
          onClick={() => {
            const sEl = document.getElementById('start-label');
            const eEl = document.getElementById('end-label');
            const startName = sEl?.getAttribute('title')?.replace(/^Start:\s*/, '') || sEl?.textContent?.replace(/^Start:\s*/, '') || null;
            const endName = eEl?.getAttribute('title')?.replace(/^End:\s*/, '') || eEl?.textContent?.replace(/^End:\s*/, '') || null;
            navigate('/fuel-calculator', { state: { distanceKm: parseFloat(routeDistanceKm.toFixed(2)), startName, endName } });
          }}
          className="fixed z-[58] md:z-[65] bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:brightness-110 text-white font-medium shadow-lg shadow-indigo-900/40 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-[13px] sm:text-sm flex items-center gap-2 transition cursor-pointer bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 ring-1 ring-white/10 whitespace-nowrap"
          aria-label="Proceed to Fuel Calculator"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="sm:hidden">Calculator</span>
          <span className="hidden sm:inline">Fuel Calculator</span>
          <span className="text-indigo-100/80 font-normal text-xs sm:text-sm ml-1 sm:ml-2">{routeDistanceKm.toFixed(1)} km</span>
        </button>
      )}

      { }
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 border-t border-gray-800 p-3 flex justify-between z-[55]">
        <button onClick={toggleSidebar} className="flex items-center justify-center py-2 px-4 bg-gray-800 rounded-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          Route
        </button>
        <button id="locateBtnMobile" className="flex items-center justify-center py-2 px-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
          My Location
        </button>
      </div>
    </div>
  );
};

export default MapPage;
