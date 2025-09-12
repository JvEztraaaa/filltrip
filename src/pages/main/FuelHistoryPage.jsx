import React, { useEffect, useMemo, useRef, useState } from "react";
import SidePanel from "../../components/SidePanel";
import Header from "../../components/Header";
import "./FuelHistoryDropdowns.css";
import {
  addRefuel,
  deleteRefuel,
  groupRefuelsByMonth,
  listRefuels,
  updateRefuel,
} from "../../services/refuel";

const currencySymbols = { PHP: "₱", USD: "$", EUR: "€", JPY: "¥" };
const FUEL_TYPES = [
  "Gasoline / Unleaded (91)",
  "Premium Gasoline (95 / 97 / 98)",
  "Diesel",
];
const DISTANCE_UNITS = { km: "Kilometers", miles: "Miles", meters: "Meters" };
const FUEL_UNITS = { liters: "Liters", gallons: "Gallons" };

function localInputValue(iso) {
  try {
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return new Date().toISOString().slice(0, 16);
  }
}

const RefuelHistoryPage = () => {
  const [groups, setGroups] = useState([]);
  const [collapsedMonths, setCollapsedMonths] = useState(new Set()); // Track collapsed months
  const [form, setForm] = useState({
    createdAt: new Date().toISOString(),
    vehicleName: "",
    odometerKm: "",
    distanceUnit: "km",
    liters: "",
    fuelUnit: "liters",
    pricePerLiter: "",
    totalCost: "",
    fuelType: FUEL_TYPES[0],
    station: "",
    currency: "PHP",
  });
  const [editing, setEditing] = useState(null); // id
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const nowMax = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const [openMenu, setOpenMenu] = useState(null); // 'fuelType' | 'currency' | 'distanceUnit' | 'fuelUnit' | null
  const fuelTypeRef = useRef(null);
  const currencyRef = useRef(null);
  const distanceUnitRef = useRef(null);
  const fuelUnitRef = useRef(null);
  const editFuelTypeRef = useRef(null);
  const editCurrencyRef = useRef(null);
  const editDistanceUnitRef = useRef(null);
  const editFuelUnitRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      const targets = [
        { ref: fuelTypeRef, key: "fuelType" },
        { ref: currencyRef, key: "currency" },
        { ref: distanceUnitRef, key: "distanceUnit" },
        { ref: fuelUnitRef, key: "fuelUnit" },
        { ref: editFuelTypeRef, key: "editFuelType" },
        { ref: editCurrencyRef, key: "editCurrency" },
        { ref: editDistanceUnitRef, key: "editDistanceUnit" },
        { ref: editFuelUnitRef, key: "editFuelUnit" },
      ];
      let inside = false;
      targets.forEach((t) => {
        if (t.ref.current && t.ref.current.contains(e.target)) inside = true;
      });
      if (!inside) setOpenMenu(null);
    };
    if (openMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  const refresh = () => setGroups(groupRefuelsByMonth(listRefuels()));
  
  // Toggle month collapse state
  const toggleMonthCollapse = (monthKey) => {
    setCollapsedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };
  
  useEffect(() => {
    refresh();
  }, []);

  const symbol = currencySymbols[form.currency] || "";
  const autoTotal = useMemo(() => {
    const l = parseFloat(form.liters) || 0;
    const p = parseFloat(form.pricePerLiter) || 0;
    return l * p || 0;
  }, [form.liters, form.pricePerLiter]);

  // Validation function
  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.vehicleName.trim()) {
      errors.vehicleName = true;
    }
    if (!formData.odometerKm || parseFloat(formData.odometerKm) <= 0) {
      errors.odometerKm = true;
    }
    if (!formData.liters || parseFloat(formData.liters) <= 0) {
      errors.liters = true;
    }
    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) <= 0) {
      errors.pricePerLiter = true;
    }
    
    return errors;
  };

  const submit = () => {
    const errors = validateForm(form);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    const entry = {
      createdAt: form.createdAt,
      vehicleName: form.vehicleName,
      odometerKm: form.odometerKm,
      distanceUnit: form.distanceUnit,
      liters: form.liters,
      fuelUnit: form.fuelUnit,
      pricePerLiter: form.pricePerLiter,
      totalCost: form.totalCost || autoTotal,
      fuelType: form.fuelType,
      station: form.station,
      currency: form.currency,
    };
    if (editing) {
      updateRefuel(editing, entry);
    } else {
      addRefuel(entry);
    }
    setForm({
      createdAt: new Date().toISOString(),
      vehicleName: "",
      odometerKm: "",
      distanceUnit: "km",
      liters: "",
      fuelUnit: "liters",
      pricePerLiter: "",
      totalCost: "",
      fuelType: FUEL_TYPES[0],
      station: "",
      currency: "PHP",
    });
    setValidationErrors({});
    setEditing(null);
    refresh();
  };

  const startEdit = (e) => {
    setEditForm({
      createdAt: e.createdAt,
      vehicleName: e.vehicleName || "",
      odometerKm: e.odometerKm,
      distanceUnit: e.distanceUnit || "km",
      liters: e.liters,
      fuelUnit: e.fuelUnit || "liters",
      pricePerLiter: e.pricePerLiter,
      totalCost: e.totalCost,
      fuelType: e.fuelType,
      station: e.station,
      currency: e.currency,
    });
    setEditing(e.id);
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    const errors = validateForm(editForm);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return; 
    }

    const entry = {
      createdAt: editForm.createdAt,
      vehicleName: editForm.vehicleName,
      odometerKm: editForm.odometerKm,
      distanceUnit: editForm.distanceUnit,
      liters: editForm.liters,
      fuelUnit: editForm.fuelUnit,
      pricePerLiter: editForm.pricePerLiter,
      totalCost: editForm.totalCost,
      fuelType: editForm.fuelType,
      station: editForm.station,
      currency: editForm.currency,
    };
    updateRefuel(editing, entry);
    setEditModalOpen(false);
    setEditing(null);
    setEditForm({});
    setValidationErrors({});
    refresh();
  };

  const cancelEdit = () => {
    setEditModalOpen(false);
    setEditing(null);
    setEditForm({});
  };

  const remove = (id) => {
    setDeleteConfirm({ show: true, id: id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteRefuel(deleteConfirm.id);
      refresh();
    }
    setDeleteConfirm({ show: false, id: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  // Clear validation error for a specific field when user starts editing
  const clearFieldError = (fieldName) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Auto-calculation for edit form
  const editAutoTotal = useMemo(() => {
    const l = parseFloat(editForm.liters) || 0;
    const p = parseFloat(editForm.pricePerLiter) || 0;
    return l * p || 0;
  }, [editForm.liters, editForm.pricePerLiter]);

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-x-hidden">
      <SidePanel />
      <Header />
      <div className="pt-20 pl-0 md:pl-64 w-full">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                  Fuel History
                </h1>
                <p className="text-gray-400 text-base mt-2 max-w-2xl">
                  Keep track of every fuel-up to monitor your vehicle's
                  consumption patterns and fuel costs over time.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700/50">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Total Entries
                  </div>
                  <div className="text-xl font-bold text-teal-400">
                    {groups.reduce((acc, g) => acc + g.items.length, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Entry Card */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-2xl">
              <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 px-6 py-4 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-teal-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {editing ? "Edit Fuel Entry" : "Add New Fuel Entry"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {editing
                        ? "Update your fuel entry details"
                        : "Record your latest fuel purchase"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Row 1: Vehicle Name - Date - Fuel Type */}
                  {/* Vehicle Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Name / Model
                    </label>
                    <input
                      type="text"
                      value={form.vehicleName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, vehicleName: e.target.value }))
                      }
                      onFocus={() => clearFieldError('vehicleName')}
                      className={`w-full px-4 py-3 rounded-lg bg-gray-800/60 border ${
                        validationErrors.vehicleName ? 'border-red-500' : 'border-gray-600'
                      } focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200`}
                      placeholder="e.g., Honda Civic"
                    />
                  </div>

                  {/* Date & Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      max={nowMax}
                      value={localInputValue(form.createdAt)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          createdAt: new Date(e.target.value).toISOString(),
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fuel Type
                    </label>
                    <div ref={fuelTypeRef} className="fuel-dropdown-container">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((m) =>
                            m === "fuelType" ? null : "fuelType"
                          )
                        }
                        className={`fuel-dropdown-button rounded-full ${
                          openMenu === "fuelType" ? "open" : ""
                        }`}
                      >
                        <span className="dropdown-text">
                          {form.fuelType}
                        </span>
                        <svg
                          className={`dropdown-arrow ${
                            openMenu === "fuelType" ? "open" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openMenu === "fuelType" && (
                        <div className="fuel-dropdown-content" style={{ maxHeight: "12rem" }}>
                          {FUEL_TYPES.map((ft) => (
                            <button
                              key={ft}
                              type="button"
                              onClick={() => {
                                setForm((f) => ({ ...f, fuelType: ft }));
                                setOpenMenu(null);
                              }}
                              className={`fuel-dropdown-item ${
                                form.fuelType === ft ? "active" : ""
                              }`}
                            >
                              {ft}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Odometer - Fuel Amount - Price per Liter */}
                  {/* Odometer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Odometer Reading
                    </label>
                    <div className={`flex rounded-lg focus-within:ring-1 focus-within:ring-teal-500 ${
                      validationErrors.odometerKm ? 'ring-1 ring-red-500 focus-within:ring-teal-500' : ''
                    }`}>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.odometerKm}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, odometerKm: e.target.value }))
                        }
                        onFocus={() => clearFieldError('odometerKm')}
                        className={`flex-1 px-4 py-3 rounded-l-lg bg-gray-800/60 border ${
                          validationErrors.odometerKm ? 'border-red-500' : 'border-gray-600'
                        } border-r-0 focus:border-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        placeholder="0.0"
                      />
                      <div className="border-l border-gray-700"></div>
                      <div ref={distanceUnitRef} className="fuel-dropdown-container dropdown-width-md">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu((m) =>
                              m === "distanceUnit" ? null : "distanceUnit"
                            )
                          }
                          className={`fuel-dropdown-button rounded-r ${
                            validationErrors.odometerKm ? 'border-red-500' : ''
                          } ${
                            openMenu === "distanceUnit" ? "open" : ""
                          }`}
                        >
                          <span className="dropdown-text">
                            {form.distanceUnit}
                          </span>
                          <svg
                            className={`dropdown-arrow ${
                              openMenu === "distanceUnit" ? "open" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {openMenu === "distanceUnit" && (
                          <div className="fuel-dropdown-content">
                            {Object.entries(DISTANCE_UNITS).map(
                              ([key, label]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setForm((f) => ({
                                      ...f,
                                      distanceUnit: key,
                                    }));
                                    setOpenMenu(null);
                                  }}
                                  className={`fuel-dropdown-item ${
                                    form.distanceUnit === key ? "active" : ""
                                  }`}
                                >
                                  {key}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fuel Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fuel Amount
                    </label>
                    <div className={`flex rounded-lg focus-within:ring-1 focus-within:ring-teal-500 ${
                      validationErrors.liters ? 'ring-1 ring-red-500 focus-within:ring-teal-500' : ''
                    }`}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.liters}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, liters: e.target.value }))
                        }
                        onFocus={() => clearFieldError('liters')}
                        className={`flex-1 px-4 py-3 rounded-l-lg bg-gray-800/60 border ${
                          validationErrors.liters ? 'border-red-500' : 'border-gray-600'
                        } border-r-0 focus:border-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        placeholder="0.00"
                      />
                      <div className="border-l border-gray-700"></div>
                      <div ref={fuelUnitRef} className="fuel-dropdown-container dropdown-width-md">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu((m) =>
                              m === "fuelUnit" ? null : "fuelUnit"
                            )
                          }
                          className={`fuel-dropdown-button rounded-r ${
                            validationErrors.liters ? 'border-red-500' : ''
                          } ${
                            openMenu === "fuelUnit" ? "open" : ""
                          }`}
                        >
                          <span className="dropdown-text">
                            {form.fuelUnit}
                          </span>
                          <svg
                            className={`dropdown-arrow ${
                              openMenu === "fuelUnit" ? "open" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {openMenu === "fuelUnit" && (
                          <div className="fuel-dropdown-content">
                            {Object.entries(FUEL_UNITS).map(([key, label]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setForm((f) => ({ ...f, fuelUnit: key }));
                                  setOpenMenu(null);
                                }}
                                className={`fuel-dropdown-item ${
                                  form.fuelUnit === key ? "active" : ""
                                }`}
                              >
                                {key}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price per Unit & Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price per{" "}
                      {form.fuelUnit === "liters" ? "Liter" : "Gallon"}
                    </label>
                    <div className={`flex rounded-lg focus-within:ring-1 focus-within:ring-teal-500 ${
                      validationErrors.pricePerLiter ? 'ring-1 ring-red-500 focus-within:ring-teal-500' : ''
                    }`}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.pricePerLiter}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            pricePerLiter: e.target.value,
                          }))
                        }
                        onFocus={() => clearFieldError('pricePerLiter')}
                        className={`flex-1 px-4 py-3 rounded-l-lg bg-gray-800/60 border ${
                          validationErrors.pricePerLiter ? 'border-red-500' : 'border-gray-600'
                        } border-r-0 focus:border-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        placeholder="0.00"
                      />
                      <div className="border-l border-gray-700"></div>
                      <div ref={currencyRef} className="fuel-dropdown-container dropdown-width-md">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu((m) =>
                              m === "currency" ? null : "currency"
                            )
                          }
                          className={`fuel-dropdown-button rounded-r ${
                            validationErrors.pricePerLiter ? 'border-red-500' : ''
                          } ${
                            openMenu === "currency" ? "open" : ""
                          }`}
                        >
                          <span className="dropdown-text">
                            {form.currency}
                          </span>
                          <svg
                            className={`dropdown-arrow ${
                              openMenu === "currency" ? "open" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {openMenu === "currency" && (
                          <div className="fuel-dropdown-content">
                            {Object.keys(currencySymbols).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setForm((f) => ({ ...f, currency: c }));
                                  setOpenMenu(null);
                                }}
                                className={`fuel-dropdown-item ${
                                  form.currency === c ? "active" : ""
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Total Cost - Station */}
                  {/* Total Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-400">
                        {symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.totalCost || autoTotal}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, totalCost: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                    {autoTotal > 0 && !form.totalCost && (
                      <p className="text-xs text-teal-400 mt-1">
                        Auto-calculated: {symbol}
                        {autoTotal.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Station */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gas Station / Location
                    </label>
                    <input
                      value={form.station}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, station: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="Shell Station, Quezon City (optional)"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-700/50">
                  <button
                    onClick={submit}
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Entry
                  </button>
                  {Object.keys(validationErrors).length > 0 && (
                    <p className="text-red-400 text-sm flex items-center">
                      Please fill up all the necessary fields
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No Fuel Records Yet
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Start tracking your fuel consumption by adding your first entry
                above. You'll be able to see patterns and trends over time.
              </p>
            </div>
          ) : (
            <div className="space-y-8 pb-20">
              {groups.map((g) => (
                <section key={g.key} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleMonthCollapse(g.key)}
                      className="flex items-center gap-3 hover:bg-gray-800/50 rounded-lg p-2 -ml-2 transition-colors cursor-pointer group"
                    >
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          collapsedMonths.has(g.key) ? '-rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <h2 className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors">
                        {g.label}
                      </h2>
                    </button>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                    <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                      {g.items.length}{" "}
                      {g.items.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>

                  {!collapsedMonths.has(g.key) && (
                    <div className="space-y-4">
                    {g.items.map((e, index) => {
                      const sym = currencySymbols[e.currency] || "";
                      const isLatest = index === 0 && g === groups[0];

                      return (
                        <div
                          key={e.id}
                          className={`group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                            isLatest
                              ? "border-teal-500/50 shadow-lg shadow-teal-500/10"
                              : "border-gray-700/50 hover:border-gray-600/80"
                          }`}
                        >
                          {isLatest && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              Latest
                            </div>
                          )}

                          <div className="p-6">
                            {/* Header */}
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                              <div className="flex-1">
                                {/* Vehicle Name */}
                                {e.vehicleName && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <svg
                                      className="w-5 h-5 text-teal-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 15l-7-7-7 7"
                                      />
                                    </svg>
                                    <span className="text-lg font-semibold text-teal-300">
                                      {e.vehicleName}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                                  <div className="text-lg font-semibold text-white">
                                    {new Date(e.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {new Date(e.createdAt).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                      />
                                    </svg>
                                    <span className="text-teal-300 font-medium">
                                      {e.fuelType}
                                    </span>
                                  </div>
                                  {e.station && (
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                      <span>{e.station}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Desktop Action Buttons */}
                              <div className="hidden lg:flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(e)}
                                  className="px-4 py-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => remove(e.id)}
                                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                  Odometer
                                </div>
                                <div className="text-lg font-bold text-teal-400">
                                  {parseFloat(e.odometerKm).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {e.distanceUnit || "km"}
                                </div>
                              </div>

                              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                  Fuel Amount
                                </div>
                                <div className="text-lg font-bold text-indigo-400">
                                  {e.liters}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {e.fuelUnit || "liters"}
                                </div>
                              </div>

                              <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                  Price per{" "}
                                  {(e.fuelUnit || "liters") === "liters"
                                    ? "Liter"
                                    : "Gallon"}
                                </div>
                                <div className="text-lg font-bold text-white">
                                  {sym}
                                  {e.pricePerLiter}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {e.currency}
                                </div>
                              </div>

                              <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-teal-500/20">
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                  Total Cost
                                </div>
                                <div className="text-xl font-bold text-teal-400">
                                  {sym}
                                  {e.totalCost}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {e.currency}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Action Buttons */}
                            <div className="lg:hidden grid grid-cols-2 gap-3">
                              <button
                                onClick={() => startEdit(e)}
                                className="w-full px-4 py-3 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit Entry
                              </button>
                              <button
                                onClick={() => remove(e.id)}
                                className="w-full px-4 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200 flex items-center justify-center gap-2 font-medium cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4"
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
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 px-6 py-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-teal-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Edit Fuel Entry
                    </h2>
                    <p className="text-sm text-gray-400">
                      Update your fuel entry details
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelEdit}
                  className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Row 1: Vehicle Name - Date - Fuel Type */}
                {/* Vehicle Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vehicle Name / Model
                  </label>
                  <input
                    type="text"
                    value={editForm.vehicleName || ""}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        vehicleName: e.target.value,
                      }))
                    }
                    onFocus={() => clearFieldError('vehicleName')}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-700/60 border ${
                      validationErrors.vehicleName ? 'border-red-500' : 'border-gray-600'
                    } focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200`}
                    placeholder="e.g., Honda Civic"
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    max={nowMax}
                    value={localInputValue(editForm.createdAt)}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        createdAt: new Date(e.target.value).toISOString(),
                      }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fuel Type
                  </label>
                  <div ref={editFuelTypeRef} className="fuel-dropdown-container">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu((m) =>
                          m === "editFuelType" ? null : "editFuelType"
                        )
                      }
                      className={`fuel-dropdown-button edit-mode rounded-full ${
                        openMenu === "editFuelType" ? "open" : ""
                      }`}
                    >
                      <span className="dropdown-text">
                        {editForm.fuelType}
                      </span>
                      <svg
                        className={`dropdown-arrow ${
                          openMenu === "editFuelType" ? "open" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openMenu === "editFuelType" && (
                      <div className="fuel-dropdown-content edit-mode" style={{ maxHeight: "12rem" }}>
                        {FUEL_TYPES.map((ft) => (
                          <button
                            key={ft}
                            type="button"
                            onClick={() => {
                              setEditForm((f) => ({ ...f, fuelType: ft }));
                              setOpenMenu(null);
                            }}
                            className={`fuel-dropdown-item edit-mode ${
                              editForm.fuelType === ft ? "active" : ""
                            }`}
                          >
                            {ft}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Odometer - Fuel Amount - Price per Liter */}
                {/* Odometer */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Odometer Reading
                  </label>
                  <div className="flex rounded-lg focus-within:ring-1 focus-within:ring-teal-500">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={editForm.odometerKm}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          odometerKm: e.target.value,
                        }))
                      }
                      className="flex-1 px-4 py-3 rounded-l-lg bg-gray-700/60 border border-gray-600 border-r-0 focus:border-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.0"
                    />
                    <div className="border-l border-gray-600"></div>
                    <div ref={editDistanceUnitRef} className="fuel-dropdown-container modal-dropdown-width-md">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((m) =>
                            m === "editDistanceUnit" ? null : "editDistanceUnit"
                          )
                        }
                        className={`fuel-dropdown-button edit-mode rounded-r ${
                          openMenu === "editDistanceUnit" ? "open" : ""
                        }`}
                      >
                        <span className="dropdown-text">
                          {editForm.distanceUnit}
                        </span>
                        <svg
                          className={`dropdown-arrow ${
                            openMenu === "editDistanceUnit" ? "open" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openMenu === "editDistanceUnit" && (
                        <div className="fuel-dropdown-content edit-mode right-aligned">
                          {Object.entries(DISTANCE_UNITS).map(
                            ([key, label]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setEditForm((f) => ({
                                    ...f,
                                    distanceUnit: key,
                                  }));
                                  setOpenMenu(null);
                                }}
                                className={`fuel-dropdown-item edit-mode ${
                                  editForm.distanceUnit === key ? "active" : ""
                                }`}
                              >
                                {key}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fuel Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fuel Amount
                  </label>
                  <div className="flex rounded-lg focus-within:ring-1 focus-within:ring-teal-500">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.liters}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, liters: e.target.value }))
                      }
                      className="flex-1 px-4 py-3 rounded-l-lg bg-gray-700/60 border border-gray-600 border-r-0 focus:border-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                    <div className="border-l border-gray-600"></div>
                    <div ref={editFuelUnitRef} className="fuel-dropdown-container modal-dropdown-width-md">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((m) =>
                            m === "editFuelUnit" ? null : "editFuelUnit"
                          )
                        }
                        className={`fuel-dropdown-button edit-mode rounded-r ${
                          openMenu === "editFuelUnit" ? "open" : ""
                        }`}
                      >
                        <span className="dropdown-text">
                          {editForm.fuelUnit}
                        </span>
                        <svg
                          className={`dropdown-arrow ${
                            openMenu === "editFuelUnit" ? "open" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openMenu === "editFuelUnit" && (
                        <div className="fuel-dropdown-content edit-mode right-aligned">
                          {Object.entries(FUEL_UNITS).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setEditForm((f) => ({ ...f, fuelUnit: key }));
                                setOpenMenu(null);
                              }}
                              className={`fuel-dropdown-item edit-mode ${
                                editForm.fuelUnit === key ? "active" : ""
                              }`}
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price per Unit & Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price per{" "}
                    {editForm.fuelUnit === "liters" ? "Liter" : "Gallon"}
                  </label>
                  <div className="flex rounded-lg focus-within:ring-1 focus-within:ring-teal-500">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.pricePerLiter}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          pricePerLiter: e.target.value,
                        }))
                      }
                      className="flex-1 px-4 py-3 rounded-l-lg bg-gray-700/60 border border-gray-600 border-r-0 focus:border-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                    <div className="border-l border-gray-600"></div>
                    <div ref={editCurrencyRef} className="fuel-dropdown-container modal-dropdown-width-md">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu((m) =>
                            m === "editCurrency" ? null : "editCurrency"
                          )
                        }
                        className={`fuel-dropdown-button edit-mode rounded-r ${
                          openMenu === "editCurrency" ? "open" : ""
                        }`}
                      >
                        <span className="dropdown-text">
                          {editForm.currency}
                        </span>
                        <svg
                          className={`dropdown-arrow ${
                            openMenu === "editCurrency" ? "open" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openMenu === "editCurrency" && (
                        <div className="fuel-dropdown-content edit-mode right-aligned">
                          {Object.keys(currencySymbols).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setEditForm((f) => ({ ...f, currency: c }));
                                setOpenMenu(null);
                              }}
                              className={`fuel-dropdown-item edit-mode ${
                                editForm.currency === c ? "active" : ""
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Total Cost - Station */}
                {/* Total Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">
                      {currencySymbols[editForm.currency] || ""}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.totalCost || editAutoTotal}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          totalCost: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200 pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                  </div>
                  {editAutoTotal > 0 && !editForm.totalCost && (
                    <p className="text-xs text-teal-400 mt-1">
                      Auto-calculated:{" "}
                      {currencySymbols[editForm.currency] || ""}
                      {editAutoTotal.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Station */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gas Station / Location
                  </label>
                  <input
                    value={editForm.station || ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, station: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/60 border border-gray-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-white placeholder-gray-400 transition-all duration-200"
                    placeholder="Shell Station, Quezon City (optional)"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-700/50">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </button>
                {Object.keys(validationErrors).length > 0 && (
                  <p className="text-red-400 text-sm flex items-center">
                    Please fill up all the necessary fields
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Fuel Entry</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this fuel log entry? This will permanently remove the entry from your history.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefuelHistoryPage;
