import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapPage from './pages/MapPage';
import VehiclePage from './pages/VehiclePage';
import './App.css';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/vehicle" element={<VehiclePage/>}/>
          <Route path="/about" element={<AboutPage/>}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
