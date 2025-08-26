import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidePanelProvider } from './components/SidePanel';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapPage from './pages/MapPage';
import ContactUsPage from './pages/ContactUsPage';
import FuelCalculatorPage from './pages/FuelCalculatorPage';
import MyTripsPage from './pages/MyTripsPage';
import RefuelHistoryPage from './pages/RefuelHistoryPage';
import StatisticsPage from './pages/StatisticsPage';
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
          </Routes>
        </SidePanelProvider>
      </Router>
    </AuthProvider>
  );
}
