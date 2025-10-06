import React, { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AdminSidePanelContext } from './AdminSidePanel';
import { useAuth } from "../../context/AuthContext";

const AdminHeader = ({ title = "Dashboard", solidBg = false }) => {
    const { sidebarOpen, openSidebar } = useContext(AdminSidePanelContext);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

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
        <>
            <div className={`w-full border-b border-gray-800 transition-all duration-300 ${solidBg ? 'bg-gray-900/95 backdrop-blur-md' : 'bg-gray-900/80 backdrop-blur-md'}`}>
                <div className={`flex items-center justify-between h-16 px-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={openSidebar}
                            className={`md:hidden p-2 text-gray-300 hover:text-blue-300 hover:bg-gray-800/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/40`}
                            aria-label="Open sidebar"
                            title="Open menu"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Title */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                                    {title}
                                </h1>
                            </div>
                            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">Admin Panel</span>
                            </div>
                        </div>
                    </div>

                    {/* Simplified User Section */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-semibold text-gray-200">{currentUser?.fullName || 'Admin'}</p>
                            <p className="text-xs text-blue-300 font-medium uppercase tracking-wide">Administrator</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminHeader;