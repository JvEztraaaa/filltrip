import React, { useContext, createContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./SidePanel.css";

export const SidePanelContext = createContext();

export const SidePanelProvider = ({ children }) => {
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
    const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(o => !o);
    const openSidebar = () => setSidebarOpen(true);

    return (
        <SidePanelContext.Provider value={{ sidebarOpen, toggleSidebar, openSidebar }}>
            {children}
        </SidePanelContext.Provider>
    );
};

const SidePanel = () => {
    const { sidebarOpen, toggleSidebar } = useContext(SidePanelContext);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        try { localStorage.removeItem('authToken'); } catch { }
        navigate('/login');
    };

    return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-gray-300 z-60 border-r border-gray-800 transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-0 pointer-events-none md:w-20 md:pointer-events-auto'} md:overflow-visible`}>
            { }
            {/* Mobile collapse button (only visible when sidebar is open on mobile) */}
            {sidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 md:hidden h-10 w-10 bg-gray-900 border border-gray-800 rounded-xl shadow-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400/40 flex items-center justify-center z-50"
                    aria-label="Collapse sidebar"
                    title="Collapse menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Desktop collapse button (middle-right edge, always visible) */}
            <button
                onClick={toggleSidebar}
                className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-8 w-8 bg-gray-900 border-2 border-teal-500/60 rounded-xl shadow-lg hover:bg-gray-800 hover:border-teal-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/40 items-center justify-center z-50"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                title={sidebarOpen ? "Collapse menu" : "Expand menu"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-teal-300 transition-transform duration-200 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Main Content Container */}
            <div className={`flex-1 overflow-y-auto overflow-x-hidden ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                {/* Logo/Brand Section */}
                <Link to="/" className={`flex items-center h-16 border-b border-gray-800 group focus:outline-none focus:ring-2 focus:ring-teal-400/40 ${sidebarOpen ? 'px-6 justify-start' : 'px-0 justify-center'}`}>
                    <img src="/images/logo.svg" alt="FillTrip" className="h-8 w-auto flex-shrink-0 transition-transform group-hover:scale-105" />
                    <span className={`ml-3 whitespace-nowrap font-bold text-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:opacity-0 md:w-0 overflow-hidden'}`}>
                        FillTrip
                    </span>
                </Link>

                {/* Navigation Section */}
                <div className={`py-6 ${sidebarOpen ? 'px-4' : 'px-3'}`}>
                    <nav className="space-y-3">
                        {/* Map */}
                        <Link to="/map" className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/map') ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20 shadow-lg shadow-teal-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-teal-300 hover:shadow-md'}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <img 
                                src="/images/map.png" 
                                alt="Map" 
                                className={`${sidebarOpen ? 'w-6 h-6' : 'w-8 h-7 ml-3'} brightness-0 invert transition-all duration-200 flex-shrink-0`}
                                style={{ filter: isActive('/map') ? 'brightness(0) invert(0.7) sepia(1) saturate(5) hue-rotate(160deg)' : 'brightness(0) invert(0.7)' }}
                            />
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Map</span>
                            {/* Tooltip for collapsed state */}
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Map
                                </div>
                            )}
                        </Link>
                        {/* Fuel Calculator */}
                        <Link to="/fuel-calculator" className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/fuel-calculator') ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20 shadow-lg shadow-teal-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-teal-300 hover:shadow-md'}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <img 
                                src="/images/fuel-calculator.png" 
                                alt="Fuel Calculator" 
                                className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7 ml-3'} brightness-0 invert transition-all duration-200 flex-shrink-0`}
                                style={{ filter: isActive('/fuel-calculator') ? 'brightness(0) invert(0.7) sepia(1) saturate(5) hue-rotate(160deg)' : 'brightness(0) invert(0.7)' }}
                            />
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Fuel Calculator</span>
                            {/* Tooltip for collapsed state */}
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Fuel Calculator
                                </div>
                            )}
                        </Link>
                        {/* My Trips */}
                        <Link to="/my-trips" className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/my-trips') ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20 shadow-lg shadow-teal-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-teal-300 hover:shadow-md'}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <img 
                                src="/images/my-trips.png" 
                                alt="My Trips" 
                                className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7 ml-3'} brightness-0 invert transition-all duration-200 flex-shrink-0`}
                                style={{ filter: isActive('/my-trips') ? 'brightness(0) invert(0.7) sepia(1) saturate(5) hue-rotate(160deg)' : 'brightness(0) invert(0.7)' }}
                            />
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>My Trips</span>
                            {/* Tooltip for collapsed state */}
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    My Trips
                                </div>
                            )}
                        </Link>
                        {/* Fuel History */}
                        <Link to="/refuel-history" className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/refuel-history') ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20 shadow-lg shadow-teal-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-teal-300 hover:shadow-md'}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <img 
                                src="/images/fuel-history.png" 
                                alt="Fuel History" 
                                className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7 ml-3'} brightness-0 invert transition-all duration-200 flex-shrink-0`}
                                style={{ filter: isActive('/refuel-history') ? 'brightness(0) invert(0.7) sepia(1) saturate(5) hue-rotate(160deg)' : 'brightness(0) invert(0.7)' }}
                            />
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Fuel History</span>
                            {/* Tooltip for collapsed state */}
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Fuel History
                                </div>
                            )}
                        </Link>
                        {/* Statistics */}
                        <Link to="/statistics" className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/statistics') ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20 shadow-lg shadow-teal-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-teal-300 hover:shadow-md'}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <img 
                                src="/images/statistics.png" 
                                alt="Statistics" 
                                className={`${sidebarOpen ? 'w-5 h-5' : 'w-7 h-7 ml-3'} brightness-0 invert transition-all duration-200 flex-shrink-0`}
                                style={{ filter: isActive('/statistics') ? 'brightness(0) invert(0.7) sepia(1) saturate(5) hue-rotate(160deg)' : 'brightness(0) invert(0.7)' }}
                            />
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Statistics</span>
                            {/* Tooltip for collapsed state */}
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Statistics
                                </div>
                            )}
                        </Link>
                    </nav>
                </div>
            </div>

            {/* User Section at bottom */}
            <div className={`border-t border-gray-800 ${sidebarOpen ? 'p-4' : 'p-2'} ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                <button 
                    onClick={handleLogout} 
                    className={`group relative w-full flex items-center transition-all duration-200 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl ${sidebarOpen ? 'px-3 py-3 justify-start' : 'px-3 py-3 justify-center'}`}
                >
                    <svg className={`${sidebarOpen ? 'w-5 h-5' : 'w-6 h-6 ml-3'} flex-shrink-0 transition-all duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Logout</span>
                    {/* Tooltip for collapsed state */}
                    {!sidebarOpen && (
                        <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            Logout
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SidePanel;
