import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    userRank: 0
  });
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // This would normally fetch from API endpoints
      // For now, using mock data since we're focused on frontend
      
      setStats({
        totalReports: 12,
        pendingReports: 3,
        verifiedReports: 9,
        userRank: 5
      });

      setReports([
        {
          id: 1,
          title: "Pothole on Main Street",
          category: "POTHOLE",
          status: "VERIFIED",
          createdAt: "2024-01-15",
          xpEarned: 25
        },
        {
          id: 2,
          title: "Broken Street Light",
          category: "STREETLIGHT", 
          status: "PENDING",
          createdAt: "2024-01-14",
          xpEarned: 0
        }
      ]);

      setLeaderboard([
        { rank: 1, username: "civicHero", xp: 1250, level: 12 },
        { rank: 2, username: "streetWatcher", xp: 980, level: 9 },
        { rank: 3, username: "reportMaster", xp: 875, level: 8 },
        { rank: 4, username: "communityGuard", xp: 720, level: 7 },
        { rank: 5, username: user.username, xp: user.xp, level: user.level }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = () => {
    setShowWalletModal(true);
    // Simulate wallet connection
    setTimeout(() => {
      setShowWalletModal(false);
      alert('🚀 Wallet connection simulation complete! In a real app, this would connect to MetaMask.');
    }, 2000);
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
        {/* Welcome Header */}
        <div className="col-12 mb-4">
          <div className="card bg-gradient-primary text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-2">🏆 Welcome back, {user.username}!</h2>
                  <p className="mb-0">Level {user.level} • {user.xp} XP • Rank #{stats.userRank}</p>
                </div>
                <div className="col-md-4 text-end">
                  <button 
                    className="btn btn-light btn-lg me-2"
                    onClick={() => window.location.href = '/report'}
                  >
                    <i className="fas fa-plus me-2"></i>New Report
                  </button>
                  <button 
                    className="btn btn-warning btn-lg"
                    onClick={connectWallet}
                  >
                    <i className="fab fa-ethereum me-2"></i>Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
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
          <div className="card border-left-success h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
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

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pending Reports
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
                    Experience Points
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{user.xp} XP</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-star fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Reports */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">My Recent Reports</h6>
              <a href="/reports" className="btn btn-sm btn-primary">View All</a>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>XP Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td>{report.title}</td>
                        <td>
                          <span className={`badge bg-${report.category === 'POTHOLE' ? 'warning' : report.category === 'STREETLIGHT' ? 'info' : 'secondary'}`}>
                            {report.category}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${report.status === 'VERIFIED' ? 'success' : report.status === 'PENDING' ? 'warning' : 'secondary'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>{report.createdAt}</td>
                        <td>
                          <strong className="text-success">+{report.xpEarned} XP</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">🏆 Leaderboard</h6>
            </div>
            <div className="card-body">
              {leaderboard.map(player => (
                <div key={player.rank} className={`d-flex align-items-center mb-3 ${player.username === user.username ? 'bg-light p-2 rounded' : ''}`}>
                  <div className="me-3">
                    <span className={`badge ${player.rank <= 3 ? 'bg-gold' : 'bg-secondary'} rounded-pill`}>
                      #{player.rank}
                    </span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold">{player.username}</div>
                    <small className="text-muted">Level {player.level}</small>
                  </div>
                  <div className="text-end">
                    <strong className="text-primary">{player.xp} XP</strong>
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <a href="/leaderboard" className="btn btn-outline-primary btn-sm">
                  View Full Leaderboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fab fa-ethereum me-2"></i>Connect Wallet
                </h5>
              </div>
              <div className="modal-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Connecting...</span>
                </div>
                <p>Connecting to MetaMask...</p>
                <small className="text-muted">Please check your wallet extension</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;