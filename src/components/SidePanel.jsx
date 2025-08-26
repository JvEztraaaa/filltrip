import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./SidePanel.css";

import { createContext, useState, useEffect } from "react";

export const SidePanelContext = createContext();

export const SidePanelProvider = ({ children }) => {
    const isDesktop = window.innerWidth >= 768;
    const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <SidePanelContext.Provider value={{ sidebarOpen, toggleSidebar }}>
            {children}
        </SidePanelContext.Provider>
    );
};

const SidePanel = () => {
    const { sidebarOpen } = useContext(SidePanelContext);

    return (
        <div className={`fixed left-0 top-0 h-full bg-gray-900 bg-opacity-95 text-gray-300 z-40 border-r border-gray-800 transition-all duration-300 
      md:w-64 ${sidebarOpen ? "w-64" : "w-0"}
    overflow-hidden`}>
            {/* Logo/Brand Section */}
            <div className="p-4 flex items-center h-16 border-b border-gray-800">
                <svg
                    className="w-6 h-6 text-teal-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="ml-3 whitespace-nowrap font-medium text-lg transition-opacity duration-300">FillTrip</span>
            </div>

            {/* Navigation Section */}
            <div className="py-4">
                <nav>
                    <Link
                        to="/"
                        className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-teal-400 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="ml-3 whitespace-nowrap">Dashboard</span>
                    </Link>

                    <Link
                        to="/map"
                        className="flex items-center px-4 py-3 text-teal-400 bg-gray-800 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="ml-3 whitespace-nowrap">Map</span>
                    </Link>

                    <Link
                        to="/about"
                        className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-teal-400 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="ml-3 whitespace-nowrap">About</span>
                    </Link>

                    <Link
                        to="/contact"
                        className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-teal-400 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="ml-3 whitespace-nowrap">Contact</span>
                    </Link>
                </nav>
            </div>

            {/* User Section at bottom */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
                <Link
                    to="/login"
                    className="flex items-center text-gray-300 hover:text-teal-400 transition-all duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="ml-3 whitespace-nowrap">Account</span>
                </Link>
            </div>
        </div>
    );
};

export default SidePanel;
