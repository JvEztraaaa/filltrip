import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidePanelProvider, AdminSidePanelContext } from '../../components/admin/AdminSidePanel';
import AdminSidePanel from '../../components/admin/AdminSidePanel';
import AdminHeader from '../../components/admin/AdminHeader';
import KPIGrid from '../../components/admin/KPIGrid';
import { 
  UserGrowthChart, 
  TripsChart, 
  TopStationsChart, 
  FrequentRoutesTable 
} from '../../components/admin/AdminCharts';
import UsersManagement from '../../components/admin/UsersManagement';
import TripsManagement from '../../components/admin/TripsManagement';
import SavedPlacesManagement from '../../components/admin/SavedPlacesManagement';
import FuelHistoryManagement from '../../components/admin/FuelHistoryManagement';
import { adminAnalytics } from '../../others/services/admin';

// Dashboard Content Component
const DashboardContent = () => {
  const { sidebarOpen } = useContext(AdminSidePanelContext);
  const [metrics, setMetrics] = useState({});
  const [chartsData, setChartsData] = useState({
    userGrowth: [],
    trips: [],
  // fuelCosts removed
    topStations: [],
    frequentRoutes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from backend
        const [metricsResponse, userGrowthResponse, tripsResponse, stationsResponse, fuelTypesResponse, routesResponse] = await Promise.all([
          adminAnalytics.getMetrics(),
          adminAnalytics.getUserGrowth(),
          adminAnalytics.getTripsAnalytics(),
          adminAnalytics.getPopularStations(),
          adminAnalytics.getFuelTypeDistribution(),
          adminAnalytics.getFrequentRoutes()
        ]);

        setMetrics(metricsResponse);
        setChartsData({
          userGrowth: userGrowthResponse.data || [],
          trips: tripsResponse.data || [],
          topStations: stationsResponse.data || [],
          fuelTypes: fuelTypesResponse.data || [],
          frequentRoutes: routesResponse.data || []
        });

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
        
        // Fallback to mock data if backend fails
        const mockMetrics = {
          totalUsers: 0,
          activeUsersToday: 0,
          totalTrips: 0,
          totalFuelLogs: 0,
          totalDistance: 0,
          totalFuelConsumed: 0,
          totalFuelCost: 0,
          mostUsedVehicle: 'N/A'
        };

        const mockChartsData = {
          userGrowth: [],
          trips: [],
          topStations: [],
          fuelTypes: [],
          frequentRoutes: []
        };

        setMetrics(mockMetrics);
        setChartsData(mockChartsData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminHeader title="Dashboard" />
      
  {/* On mobile (<md) sidebar should overlay and NOT push content; only shift at md+ */}
  <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-20'} p-6`}>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Dashboard Overview</h2>
            <p className="text-gray-400">Key metrics and system performance indicators</p>
          </div>
          <KPIGrid metrics={metrics} loading={loading} />
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <UserGrowthChart data={chartsData.userGrowth} loading={loading} />
            <TripsChart data={chartsData.trips} loading={loading} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopStationsChart data={chartsData.topStations} loading={loading} />
            <FrequentRoutesTable data={chartsData.frequentRoutes} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component with Routes
const AdminDashboardMain = () => {
  const { currentUser } = useAuth();
  const { sidebarOpen } = useContext(AdminSidePanelContext);

  // Basic protection - ensure user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-xl backdrop-blur-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have administrator privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminSidePanel />
      {/* Mobile overlay backdrop when sidebar is open (visual only) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 md:hidden z-50 pointer-events-none" />
      )}
      
      <Routes>
        <Route path="/" element={<DashboardContent />} />
        <Route path="/users" element={
          <div className="min-h-screen">
            <AdminHeader title="Users Management" />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-20'} p-4 sm:p-6`}>
              <UsersManagement />
            </div>
          </div>
        } />
        <Route path="/trips" element={
          <div className="min-h-screen">
            <AdminHeader title="Trips Management" />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-20'} p-4 sm:p-6`}>
              <TripsManagement />
            </div>
          </div>
        } />
        <Route path="/saved-places" element={
          <div className="min-h-screen">
            <AdminHeader title="Saved Places Management" />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-20'} p-4 sm:p-6`}>
              <SavedPlacesManagement />
            </div>
          </div>
        } />
        <Route path="/fuel-history" element={
          <div className="min-h-screen">
            <AdminHeader title="Fuel History Management" />
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-20'} p-4 sm:p-6`}>
              <FuelHistoryManagement />
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

// Wrapper component with provider
export default function AdminDashboard() {
  return (
    <AdminSidePanelProvider>
      <AdminDashboardMain />
    </AdminSidePanelProvider>
  );
}
