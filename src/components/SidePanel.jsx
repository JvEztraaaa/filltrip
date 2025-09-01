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

    const linkBase = "flex items-center px-4 py-3 transition-all duration-200";
    const inactive = "text-gray-300 hover:bg-gray-800 hover:text-teal-400";
    const active = "text-teal-400 bg-gray-800";

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        try { localStorage.removeItem('authToken'); } catch { }
        navigate('/login');
    };

    return (
        <div className={`fixed left-0 top-0 h-full bg-gray-900 bg-opacity-95 text-gray-300 z-60 border-r border-gray-800 transition-all duration-300 overflow-visible flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-0 pointer-events-none'} md:w-64 md:pointer-events-auto`}>
            { }
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

            { }
            <div className={`flex-1 overflow-y-auto ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                {/* Logo/Brand Section */}
                <Link to="/" className="p-4 flex items-center h-16 border-b border-gray-800 group focus:outline-none focus:ring-2 focus:ring-teal-400/40">
                    <img src="/images/logo.svg" alt="FillTrip" className="h-8 w-auto flex-shrink-0 transition-transform group-hover:scale-105" />
                    <span className={`ml-3 whitespace-nowrap font-bold text-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                        FillTrip
                    </span>
                </Link>

                {/* Navigation Section */}
                <div className="py-4">
                    <nav>
                        { }
                        <Link to="/map" className={`${linkBase} ${isActive('/map') ? active : inactive}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap ${sidebarOpen ? 'inline-block' : 'hidden md:inline-block'}`}>Map</span>
                        </Link>
                        <Link to="/fuel-calculator" className={`${linkBase} ${isActive('/fuel-calculator') ? active : inactive}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h7l2 3h9v13a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap ${sidebarOpen ? 'inline-block' : 'hidden md:inline-block'}`}>Fuel Calculator</span>
                        </Link>
                        <Link to="/my-trips" className={`${linkBase} ${isActive('/my-trips') ? active : inactive}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m6 13l4.553 2.276A1 1 0 0021 20.382V9.618a1 1 0 00-.553-.894L15 6m0 14V6m0 0L9 7" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap ${sidebarOpen ? 'inline-block' : 'hidden md:inline-block'}`}>My Trips</span>
                        </Link>
                        <Link to="/refuel-history" className={`${linkBase} ${isActive('/refuel-history') ? active : inactive}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap ${sidebarOpen ? 'inline-block' : 'hidden md:inline-block'}`}>Refuel History</span>
                        </Link>
                        <Link to="/statistics" className={`${linkBase} ${isActive('/statistics') ? active : inactive}`} onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap ${sidebarOpen ? 'inline-block' : 'hidden md:inline-block'}`}>Statistics</span>
                        </Link>
                    </nav>
                </div>
            </div>

            {/* User Section at bottom (hidden on mobile when closed) */}
            <div className={`border-t border-gray-800 p-2 md:p-4 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                <button onClick={handleLogout} className="w-full flex items-center justify-start text-red-400 hover:text-red-300 transition-all duration-200 font-medium cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    <span className="ml-3 whitespace-nowrap">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default SidePanel;
