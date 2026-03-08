import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DeviceList from './pages/DeviceList'
import CreateDashboard from './pages/CreateDashboard'
import AdminPanel from './pages/AdminPanel'
import DataLogs from './pages/DataLogs'
import CarSensorSystem from './pages/CarSensorSystem'
import Layout from './components/Layout'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-dark-bg text-dark-accent">Loading...</div>; // Prevent immediate redirect
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<DeviceList />} />
          <Route path="create-dashboard" element={<CreateDashboard />} />
          <Route path="sensors" element={<CarSensorSystem />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="logs" element={<DataLogs />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
