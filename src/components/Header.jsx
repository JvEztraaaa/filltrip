import React, { useContext } from "react";
import { useLocation } from 'react-router-dom';
import { SidePanelContext } from './SidePanel';

const Header = () => {
    const location = useLocation();
    const { sidebarOpen, openSidebar } = useContext(SidePanelContext);

    const pathTitleMap = {
        '/': 'Home',
        '/map': 'Map',
        '/fuel-calculator': 'Fuel Calculator',
        '/my-trips': 'My Trips',
        '/refuel-history': 'Refuel History',
        '/statistics': 'Statistics',
        '/login': 'Login',
        '/signup': 'Sign Up'
    };
    const dynamicTitle = pathTitleMap[location.pathname] || 'FillTrip';

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center px-2 py-2">
            { }
            <div className="w-10 md:hidden flex-shrink-0 flex justify-start">
                {!sidebarOpen && (
                    <button
                        onClick={openSidebar}
                        aria-label="Open navigation"
                        className="p-2 rounded-md bg-gray-800/70 hover:bg-gray-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                )}
            </div>
            <h2 className="flex-1 text-xl font-bold text-center">
                <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent font-extrabold tracking-wide drop-shadow-sm">{dynamicTitle}</span>
            </h2>
            { }
            <div className="w-10 md:hidden" />
        </div>
    );
};

export default Header;
