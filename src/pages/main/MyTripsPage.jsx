import React from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';

const MyTripsPage = () => {
    return (
    <div className="relative h-screen w-full bg-gray-900 text-white overflow-hidden overflow-x-hidden">
            <SidePanel />
            <Header />
            <div className="pt-20 pl-0 md:pl-64 p-4">
                <h1 className="text-2xl font-semibold mb-4">My Trips</h1>
                <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
        </div>
    );
};

export default MyTripsPage;
