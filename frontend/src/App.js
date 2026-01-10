import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import FedExDashboard from './pages/FedExDashboard';
import DcaDashboard from './pages/DcaDashboard';
import Agent1Dashboard from './pages/Agent1Dashboard';  // New
import Agent2Dashboard from './pages/Agent2Dashboard';  // New
import PredictiveAnalysis from './pages/PredictiveAnalysis';
import PerDcaAnalysis from './pages/PerDcaAnalysis';

function App() {
  const [role, setRole] = useState(null);  // Track user role after login

  return (
    <Router>
      <Routes>
        <Route path="/" element={role ? <Navigate to={`/${role}`} /> : <Auth setRole={setRole} />} />  {/* Default to login if not logged in */}
        <Route path="/fedex" element={<FedExDashboard />} />
        <Route path="/dca" element={<DcaDashboard />} />
        <Route path="/agent1" element={<Agent1Dashboard />} />
        <Route path="/agent2" element={<Agent2Dashboard />} />
        <Route path="/predictive-analysis" element={<PredictiveAnalysis />} />
        <Route path="/per-dca-analysis" element={<PerDcaAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;