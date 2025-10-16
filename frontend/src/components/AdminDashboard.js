import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Mock admin data
      setStats({
        totalUsers: 156,
        totalReports: 342,
        pendingReports: 23,
        verifiedReports: 319
      });

      setReports([
        {
          id: 1,
          title: "Pothole on Main Street",
          category: "POTHOLE",
          status: "PENDING",
          reporter: "johnDoe",
          createdAt: "2024-01-15",
          priority: "HIGH"
        },
        {
          id: 2,
          title: "Broken Traffic Light",
          category: "TRAFFIC",
          status: "PENDING", 
          reporter: "janeDoe",
          createdAt: "2024-01-14",
          priority: "CRITICAL"
        }
      ]);

      setUsers([
        { id: 1, username: "johnDoe", email: "john@example.com", role: "USER", xp: 450, status: "ACTIVE" },
        { id: 2, username: "janeDoe", email: "jane@example.com", role: "USER", xp: 320, status: "ACTIVE" },
        { id: 3, username: "reportMaster", email: "master@example.com", role: "USER", xp: 875, status: "ACTIVE" }
      ]);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      // In real app, this would call the backend
      const updatedReports = reports.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'VERIFIED' : 'REJECTED' }
          : report
      );
      setReports(updatedReports);
      alert(`Report ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating report:', error);
    }
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
    <div className="container-fluid">
      <div className="row">
        {/* Admin Header */}
        <div className="col-12 mb-4">
          <div className="card bg-gradient-danger text-white">
            <div className="card-body">
              <h2 className="mb-2">⚡ Admin Dashboard</h2>
              <p className="mb-0">Welcome, {user.username}! Manage users and oversee civic reports.</p>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalUsers}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Reports
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.totalReports}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pending Review
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.pendingReports}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Verified Reports
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.verifiedReports}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Pending Reports */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Pending Reports - Need Review</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Reporter</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.filter(r => r.status === 'PENDING').map(report => (
                      <tr key={report.id}>
                        <td>{report.title}</td>
                        <td>
                          <span className="badge bg-secondary">{report.category}</span>
                        </td>
                        <td>{report.reporter}</td>
                        <td>
                          <span className={`badge bg-${report.priority === 'CRITICAL' ? 'danger' : report.priority === 'HIGH' ? 'warning' : 'info'}`}>
                            {report.priority}
                          </span>
                        </td>
                        <td>{report.createdAt}</td>
                        <td>
                          <button 
                            className="btn btn-success btn-sm me-1"
                            onClick={() => handleReportAction(report.id, 'approve')}
                          >
                            <i className="fas fa-check"></i> Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReportAction(report.id, 'reject')}
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">👥 User Management</h6>
            </div>
            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {users.map(userData => (
                <div key={userData.id} className="d-flex align-items-center justify-content-between mb-3 p-2 border rounded">
                  <div className="flex-grow-1">
                    <div className="fw-bold">{userData.username}</div>
                    <small className="text-muted">{userData.email}</small>
                    <div>
                      <span className="badge bg-primary me-1">{userData.role}</span>
                      <span className="badge bg-success">{userData.xp} XP</span>
                    </div>
                  </div>
                  <div>
                    <span className={`badge bg-${userData.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                      {userData.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <button className="btn btn-outline-primary btn-sm">
                  View All Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">🚀 Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <button className="btn btn-primary btn-block w-100">
                    <i className="fas fa-chart-bar me-2"></i>Generate Report
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-success btn-block w-100">
                    <i className="fas fa-user-plus me-2"></i>Add Admin User
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-warning btn-block w-100">
                    <i className="fas fa-cog me-2"></i>System Settings
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button className="btn btn-info btn-block w-100">
                    <i className="fas fa-download me-2"></i>Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;