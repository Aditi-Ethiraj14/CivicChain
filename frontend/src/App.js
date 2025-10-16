import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import Leaderboard from './components/Leaderboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="container-fluid py-4">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  user.role === 'ADMIN' ? <AdminDashboard user={user} /> : <UserDashboard user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            
            <Route 
              path="/report" 
              element={user ? <ReportForm user={user} /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/reports" 
              element={user ? <ReportList user={user} /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/leaderboard" 
              element={user ? <Leaderboard /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Only Routes */}
            <Route 
              path="/admin/*" 
              element={
                user && user.role === 'ADMIN' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />
              } 
            />
            
            {/* Default Route */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;