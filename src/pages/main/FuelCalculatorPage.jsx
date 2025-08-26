import React from 'react';
import SidePanel from '../../components/SidePanel';
import Header from '../../components/Header';

const FuelCalculatorPage = () => {
  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white overflow-hidden">
      <SidePanel />
      <Header />
      <div className="pt-20 pl-0 md:pl-64 p-4">
        <h1 className="text-2xl font-semibold mb-4">Fuel Calculator</h1>
        <p className="text-gray-400 text-sm">Coming soon...</p>
      </div>
    </div>
  );
};

export default FuelCalculatorPage;
