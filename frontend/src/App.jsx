import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DeviceList from './pages/DeviceList'
import CreateDashboard from './pages/CreateDashboard'
import AdminPanel from './pages/AdminPanel'
import DataLogs from './pages/DataLogs'
import DevicesAndInfrastructure from './pages/DevicesAndInfrastructure'

import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Axios global interceptor for 401 Unauthorized
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch fresh user data (ensures role is up to date)
          const res = await axios.get('https://adas-4cqb.onrender.com/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Update local storage user profile with fresh data
          localStorage.setItem('user', JSON.stringify(res.data));
          setIsAuthenticated(true);
        } catch (error) {
          // Interceptor will handle the 401 error and log out
          console.error("Token verification failed", error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
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

          {/* Admin Only Routes */}
          <Route path="create-dashboard" element={<AdminRoute><CreateDashboard /></AdminRoute>} />

          <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="infrastructure" element={<AdminRoute><DevicesAndInfrastructure /></AdminRoute>} />
          <Route path="logs" element={<AdminRoute><DataLogs /></AdminRoute>} />

          {/* Catch-all redirect for /dashboard to index map */}
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
