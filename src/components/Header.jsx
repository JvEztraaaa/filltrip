import React, { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { SidePanelContext } from './SidePanel';
import { useAuth } from "../context/AuthContext";
import AccountSettingsModal from "./AccountSettingsModal";

const Header = () => {
    const { sidebarOpen, openSidebar } = useContext(SidePanelContext);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const anchorRef = useRef(null);
    const menuPortalRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

    useEffect(() => {
        function onDocClick(e) {
            const insideAnchor = anchorRef.current && anchorRef.current.contains(e.target);
            const insideMenu = menuPortalRef.current && menuPortalRef.current.contains(e.target);
            if (!insideAnchor && !insideMenu) setMenuOpen(false);
        }
        function onEsc(e) {
            if (e.key === 'Escape') setMenuOpen(false);
        }
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, []);

    const computeMenuPos = () => {
        try {
            const rect = anchorRef.current?.getBoundingClientRect();
            if (!rect) return;
            const gap = 8;
            setMenuPos({ top: rect.bottom + gap, right: Math.max(window.innerWidth - rect.right, 8) });
        } catch {}
    };

    useEffect(() => {
        if (!menuOpen) return;
        computeMenuPos();
        const onWin = () => computeMenuPos();
        window.addEventListener('resize', onWin);
        window.addEventListener('scroll', onWin, true);
        return () => {
            window.removeEventListener('resize', onWin);
            window.removeEventListener('scroll', onWin, true);
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
    <div className="fixed top-0 left-0 right-0 z-[45] bg-gray-900/95 backdrop-blur-md border-b border-gray-800 flex items-center px-2 sm:px-3 py-2 sm:py-2.5 shadow-lg">
            {/* Mobile burger */}
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
            {/* Spacer to center actions visually when burger exists */}
            <div className="flex-1" />

            {/* Right actions: username + avatar */}
            <div className="relative" ref={anchorRef}>
                {currentUser ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="hidden sm:inline text-sm text-gray-200/90 dark:text-gray-100 truncate max-w-[10rem]" title={currentUser?.username || currentUser?.fullName}>
                            {currentUser?.username || currentUser?.fullName || 'User'}
                        </span>
                                                <button
                            onClick={() => setMenuOpen(v => { const nv = !v; if (!v) computeMenuPos(); return nv; })}
                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 text-gray-100 ring-1 ring-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/40 transition-all shadow-md cursor-pointer overflow-hidden"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            aria-label="User menu"
                        >
                                                        <span className="sr-only">Open user menu</span>
                                                        {currentUser?.avatarUrl ? (
                                                            <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3.172 20.828A4 4 0 017 19h10a4 4 0 013.828 1.828A1 1 0 0119.999 23H4.001a1 1 0 01-.829-1.672z" />
                                                            </svg>
                                                        )}
                        </button>
                        {menuOpen && createPortal(
                            <div ref={menuPortalRef} role="menu" style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                                 className="z-[95] w-72 max-w-[92vw] max-h-[calc(100vh-6rem)] overflow-auto origin-top-right rounded-xl bg-gray-900 text-gray-100 border border-gray-800 shadow-2xl">
                                <div className="px-4 py-3 bg-gray-800 rounded-t-xl">
                                    <p className="text-sm font-semibold truncate">{currentUser?.fullName || currentUser?.username}</p>
                                    <p className="text-xs text-gray-300/90 truncate">{currentUser?.email}</p>
                                </div>
                                <div className="py-1 divide-y divide-gray-800">
                                    <button onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800/90 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.936a7.953 7.953 0 000-1.872l2.036-1.58a.5.5 0 00.12-.64l-1.928-3.34a.5.5 0 00-.607-.22l-2.397.96a7.99 7.99 0 00-1.62-.94l-.36-2.54A.5.5 0 0013.9 0h-3.8a.5.5 0 00-.494.42l-.36 2.54a7.99 7.99 0 00-1.62.94l-2.397-.96a.5.5 0 00-.607.22L2.694 7.004a.5.5 0 00.12.64l2.036 1.58a7.953 7.953 0 000 1.872l-2.036 1.58a.5.5 0 00-.12.64l1.928 3.34a.5.5 0 00.607.22l2.397-.96c.507.39 1.05.71 1.62.94l.36 2.54a.5.5 0 00.494.42h3.8a.5.5 0 00.494-.42l.36-2.54c.57-.23 1.113-.55 1.62-.94l2.397.96a.5.5 0 00.607-.22l1.928-3.34a.5.5 0 00-.12-.64l-2.036-1.58zM12 15a3 3 0 110-6 3 3 0 010 6z"/></svg>
                                        Account settings
                                    </button>
                                    <button onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800/90 hover:text-red-300 transition-colors flex items-center gap-2 cursor-pointer rounded-b-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16 17v-2H9V9h7V7l5 5-5 5z"/><path d="M14 2H4a2 2 0 00-2 2v16a2 2 0 002 2h10v-2H4V4h10V2z"/></svg>
                                        Sign out
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/login')} className="px-3 py-1.5 text-sm rounded-md text-teal-200 hover:text-white hover:bg-teal-600/20">Log in</button>
                        <button onClick={() => navigate('/signup')} className="px-3 py-1.5 text-sm rounded-md bg-teal-500 hover:bg-teal-400 text-white shadow">Sign up</button>
                    </div>
                )}
            </div>

            <AccountSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
};

export default Header;
