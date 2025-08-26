import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapPage.css";
import Header from "../components/Header";
import SidePanel from "../components/SidePanel";

const MapPage = () => {
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11", // Default theme
      center: [121.774, 12.8797], // PH center
      zoom: 5,
    });

    let startCoords = null,
      endCoords = null,
      startMarker = null,
      endMarker = null;

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

    function setStart(coords, label) {
      startCoords = coords;
      if (startMarker) startMarker.remove();
      startMarker = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat(coords)
        .addTo(map);
      startLabel.textContent = "Start: " + label;
      updateRoute();
    }

    function setEnd(coords, label) {
      endCoords = coords;
      if (endMarker) endMarker.remove();
      endMarker = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(coords)
        .addTo(map);
      endLabel.textContent = "End: " + label;
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
      distanceEl.textContent = (route.distance / 1000).toFixed(2) + " km";
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
      const mode = document.querySelector("input[name=pickMode]:checked").value;
      const coords = [e.lngLat.lng, e.lngLat.lat];
      const label = `Dropped pin (${coords[1].toFixed(4)},${coords[0].toFixed(4)})`;
      if (mode === "start") setStart(coords, label);
      else setEnd(coords, label);
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
    });

    document.getElementById("swapBtn").addEventListener("click", () => {
      [startCoords, endCoords] = [endCoords, startCoords];
      [startMarker, endMarker] = [endMarker, startMarker];
      const tmp = startLabel.textContent;
      startLabel.textContent = endLabel.textContent;
      endLabel.textContent = tmp;
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

    // --- Cleanup on unmount ---
    return () => {
      map.remove();
      cleanups.forEach((fn) => fn && fn());
      window.removeEventListener("resize", handleResize);
      if (locateBtnMobile) {
        locateBtnMobile.removeEventListener("click", handleLocate);
      }
    };
  }, []);

  // Sidebar toggle state for managing the map sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar toggle - only for the map sidebar, not the navigation sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
    // Trigger window resize event to ensure map adjusts properly
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
        className="fixed top-16 right-4 z-[55] bg-gray-800 hover:bg-gray-700 p-3 rounded-md shadow-lg flex items-center justify-center text-white transition-all duration-200"
        aria-label="Toggle route sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      { }
      {isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className={`fixed right-4 z-[65] bg-red-600 hover:bg-red-700 p-2 rounded-md shadow-lg flex items-center justify-center text-white transition-opacity duration-200`}
          aria-label="Close sidebar"
          style={{ top: window.innerWidth >= 768 ? '80px' : '16px' }}
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
        className={`fixed top-0 right-0 h-full bg-gray-900 text-white shadow-lg p-4 overflow-y-auto transition-all duration-300 z-[60] w-full md:w-80 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} pt-16 md:pt-16 closed-${!isSidebarOpen}`}
      >
        { }
        { }
        { }
        <div className="pt-8 md:pt-12 mb-4"></div>

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
        <div className="grid grid-cols-2 gap-4 mb-5 bg-gray-800 rounded-lg p-3">
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
