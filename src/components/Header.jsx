import React, { useContext } from "react";
import { SidePanelContext } from "./SidePanel";

const Header = () => {
    const { toggleSidebar } = useContext(SidePanelContext);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center p-2">
            { }
            <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors mr-3 bg-gray-800/60 z-50"
                aria-label="Toggle navigation"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <h2 className="text-xl font-bold gradient-text text-center flex-grow">Filltrip Router</h2>
        </div>
    );
};

export default Header;
