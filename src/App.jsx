import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidePanelProvider } from './components/SidePanel';
import LandingPage from './pages/dashboard/LandingPage';
import AboutPage from './pages/dashboard/AboutPage';
import LoginPage from './pages/dashboard/LoginPage';
import SignupPage from './pages/dashboard/SignupPage';
import MapPage from './pages/main/MapPage';
import ContactUsPage from './pages/dashboard/ContactUsPage';
import FuelCalculatorPage from './pages/main/FuelCalculatorPage';
import MyTripsPage from './pages/main/MyTripsPage';
import RefuelHistoryPage from './pages/main/FuelHistoryPage';
import StatisticsPage from './pages/main/StatisticsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <SidePanelProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/fuel-calculator" element={<FuelCalculatorPage />} />
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/refuel-history" element={<RefuelHistoryPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </SidePanelProvider>
      </Router>
    </AuthProvider>
  );
}
