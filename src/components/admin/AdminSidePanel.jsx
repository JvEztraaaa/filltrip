import React, { useContext, createContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../SidePanel.css";

export const AdminSidePanelContext = createContext();

export const AdminSidePanelProvider = ({ children }) => {
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
        <AdminSidePanelContext.Provider value={{ sidebarOpen, toggleSidebar, openSidebar }}>
            {children}
        </AdminSidePanelContext.Provider>
    );
};

const AdminSidePanel = () => {
    const { sidebarOpen, toggleSidebar } = useContext(AdminSidePanelContext);
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    return (
        <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-md text-gray-300 z-60 border-r border-gray-800 transition-all duration-300 flex flex-col
            ${sidebarOpen ? 'w-64' : 'w-0 pointer-events-none md:w-20 md:pointer-events-auto'} md:overflow-visible`}>
            
            {/* Mobile collapse button */}
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

            {/* Desktop collapse button */}
            <button
                onClick={toggleSidebar}
                className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-8 w-8 bg-gray-900 border-2 border-blue-500/60 rounded-xl shadow-lg hover:bg-gray-800 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40 items-center justify-center z-50"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                title={sidebarOpen ? "Collapse menu" : "Expand menu"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-blue-300 transition-transform duration-200 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Main Content Container */}
            <div className={`flex-1 overflow-y-auto overflow-x-hidden ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                {/* Logo/Brand Section */}
                <Link to="/admin" className={`flex items-center h-16 border-b border-gray-800 group focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${sidebarOpen ? 'px-6 justify-start' : 'px-0 justify-center'}`}>
                    <img src="/images/logo.svg" alt="FillTrip Admin" className="h-8 w-auto flex-shrink-0 transition-transform group-hover:scale-105" />
                    <div className={`ml-3 transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:opacity-0 md:w-0 overflow-hidden'}`}>
                        <span className="whitespace-nowrap font-bold text-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                            FillTrip
                        </span>
                        <span className="block text-xs text-blue-300/80 font-medium">Admin Panel</span>
                    </div>
                </Link>

                {/* Navigation Section */}
                <div className={`py-6 ${sidebarOpen ? 'px-4' : 'px-3'}`}>
                    <nav className="space-y-3">
                        {/* Dashboard */}
                        <Link 
                            to="/admin" 
                            className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/admin') ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-blue-300 hover:shadow-md'}`} 
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                        >
                            <svg className={`${sidebarOpen ? 'w-6 h-6 ml-1' : 'w-7 h-7 ml-3'} transition-all duration-200 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Dashboard</span>
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Dashboard
                                </div>
                            )}
                        </Link>

                        {/* Management Section Divider */}
                        <div className={`relative my-6 ${sidebarOpen ? 'px-3' : 'px-4'}`}>
                            {sidebarOpen ? (
                                <div className="flex items-center">
                                    <div className="flex-1 h-px bg-gray-700"></div>
                                    <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</span>
                                    <div className="flex-1 h-px bg-gray-700"></div>
                                </div>
                            ) : (
                                <div className="h-px bg-gray-700 mx-auto w-8"></div>
                            )}
                        </div>

                        {/* Users */}
                        <Link 
                            to="/admin/users" 
                            className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/admin/users') ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-blue-300 hover:shadow-md'}`}
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                        >
                            <svg className={`${sidebarOpen ? 'w-6 h-6 ml-1' : 'w-7 h-7 ml-3'} transition-all duration-200 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Users</span>
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Users
                                </div>
                            )}
                        </Link>

                        {/* Trips */}
                        <Link 
                            to="/admin/trips" 
                            className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/admin/trips') ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-blue-300 hover:shadow-md'}`}
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                        >
                            <svg className={`${sidebarOpen ? 'w-6 h-6 ml-1' : 'w-7 h-7 ml-3'} transition-all duration-200 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Trips</span>
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Trips
                                </div>
                            )}
                        </Link>

                        {/* Saved Places */}
                        <Link 
                            to="/admin/saved-places" 
                            className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/admin/saved-places') ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-blue-300 hover:shadow-md'}`}
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                        >
                            <svg className={`${sidebarOpen ? 'w-6 h-6 ml-1' : 'w-7 h-7 ml-3'} transition-all duration-200 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Saved Places</span>
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Saved Places
                                </div>
                            )}
                        </Link>

                        {/* Fuel History */}
                        <Link 
                            to="/admin/fuel-history" 
                            className={`group relative flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded-xl ${sidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'} ${isActive('/admin/fuel-history') ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-300 hover:bg-gray-800/70 hover:text-blue-300 hover:shadow-md'}`}
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                        >
                            <svg className={`${sidebarOpen ? 'w-6 h-6 ml-1' : 'w-7 h-7 ml-3'} transition-all duration-200 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Fuel History</span>
                            {!sidebarOpen && (
                                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    Fuel History
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
                    <svg className={`${sidebarOpen ? 'w-5 h-5 ml-1' : 'w-6 h-6 ml-3'} flex-shrink-0 transition-all duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    <span className={`ml-3 whitespace-nowrap font-medium transition-all duration-300 ${sidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 md:opacity-0 w-0 md:w-0 overflow-hidden'}`}>Logout</span>
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

export default AdminSidePanel;

