import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL_TIME');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    // Mock leaderboard data
    const mockData = [
      { rank: 1, username: "civicHero", xp: 1250, level: 12, reports: 45, verified: 42, badges: ["Top Reporter", "AI Expert"] },
      { rank: 2, username: "streetWatcher", xp: 980, level: 9, reports: 38, verified: 35, badges: ["Community Hero"] },
      { rank: 3, username: "reportMaster", xp: 875, level: 8, reports: 32, verified: 30, badges: ["Accurate Reporter"] },
      { rank: 4, username: "communityGuard", xp: 720, level: 7, reports: 28, verified: 25, badges: ["Local Champion"] },
      { rank: 5, username: "urbanWatcher", xp: 650, level: 6, reports: 25, verified: 22, badges: [] },
      { rank: 6, username: "safetyFirst", xp: 580, level: 5, reports: 22, verified: 20, badges: [] },
      { rank: 7, username: "civicMinded", xp: 520, level: 5, reports: 20, verified: 18, badges: [] },
      { rank: 8, username: "alertCitizen", xp: 480, level: 4, reports: 18, verified: 16, badges: [] },
      { rank: 9, username: "neighborWatch", xp: 420, level: 4, reports: 16, verified: 14, badges: [] },
      { rank: 10, username: "publicEye", xp: 380, level: 3, reports: 14, verified: 12, badges: [] }
    ];
    
    setLeaderboard(mockData);
    setLoading(false);
  };

  const getBadgeColor = (badge) => {
    const colors = {
      "Top Reporter": "bg-warning",
      "AI Expert": "bg-info", 
      "Community Hero": "bg-success",
      "Accurate Reporter": "bg-primary",
      "Local Champion": "bg-danger"
    };
    return colors[badge] || "bg-secondary";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
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
    <div className="container">
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3><i className="fas fa-trophy me-2 text-warning"></i>Community Leaderboard</h3>
              <div className="btn-group" role="group">
                <button 
                  className={`btn btn-sm ${filter === 'ALL_TIME' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('ALL_TIME')}
                >
                  All Time
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'THIS_MONTH' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('THIS_MONTH')}
                >
                  This Month
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'THIS_WEEK' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('THIS_WEEK')}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Level</th>
                      <th>XP</th>
                      <th>Reports</th>
                      <th>Verified</th>
                      <th>Success Rate</th>
                      <th>Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, index) => (
                      <tr key={player.username} className={index < 3 ? 'table-warning' : ''}>
                        <td className="fw-bold">
                          <span className="fs-4">{getRankIcon(player.rank)}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold">{player.username}</div>
                              <small className="text-muted">Community Member</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info rounded-pill">
                            Level {player.level}
                          </span>
                        </td>
                        <td>
                          <strong className="text-primary">{player.xp.toLocaleString()} XP</strong>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{player.reports}</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{player.verified}</span>
                        </td>
                        <td>
                          <div className="progress" style={{ height: '20px', width: '80px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${(player.verified / player.reports * 100)}%` }}
                            >
                              {Math.round(player.verified / player.reports * 100)}%
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {player.badges.map((badge, badgeIndex) => (
                              <span 
                                key={badgeIndex} 
                                className={`badge ${getBadgeColor(badge)} text-white`}
                                style={{ fontSize: '0.7em' }}
                              >
                                {badge}
                              </span>
                            ))}
                            {player.badges.length === 0 && (
                              <small className="text-muted">No badges yet</small>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* XP Guide */}
        <div className="col-12 mt-4">
          <div className="card">
            <div className="card-header">
              <h5><i className="fas fa-info-circle me-2"></i>How to Earn XP</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center mb-3">
                  <div className="bg-primary text-white rounded p-3">
                    <i className="fas fa-plus-circle fa-2x mb-2"></i>
                    <h6>Submit Report</h6>
                    <strong>+10 XP</strong>
                  </div>
                </div>
                <div className="col-md-3 text-center mb-3">
                  <div className="bg-success text-white rounded p-3">
                    <i className="fas fa-check-circle fa-2x mb-2"></i>
                    <h6>Report Verified</h6>
                    <strong>+25 XP</strong>
                  </div>
                </div>
                <div className="col-md-3 text-center mb-3">
                  <div className="bg-info text-white rounded p-3">
                    <i className="fas fa-robot fa-2x mb-2"></i>
                    <h6>AI Verification</h6>
                    <strong>+15 XP</strong>
                  </div>
                </div>
                <div className="col-md-3 text-center mb-3">
                  <div className="bg-warning text-white rounded p-3">
                    <i className="fas fa-thumbs-up fa-2x mb-2"></i>
                    <h6>Community Vote</h6>
                    <strong>+5 XP</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;