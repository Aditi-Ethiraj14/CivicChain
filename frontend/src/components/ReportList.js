import React, { useState, useEffect } from 'react';

const ReportList = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Mock data
    const mockReports = [
      {
        id: 1,
        title: "Pothole on Main Street",
        category: "POTHOLE",
        status: "PENDING",
        reporter: "johnDoe",
        createdAt: "2024-01-15",
        description: "Large pothole causing traffic issues",
        location: "Main St & 5th Ave",
        votes: { up: 12, down: 2 },
        userVote: null,
        aiVerified: true,
        confidence: 0.85
      },
      {
        id: 2,
        title: "Broken Street Light",
        category: "STREETLIGHT", 
        status: "VERIFIED",
        reporter: "janeDoe",
        createdAt: "2024-01-14",
        description: "Street light not working for 3 days",
        location: "Park Avenue",
        votes: { up: 8, down: 1 },
        userVote: 'up',
        aiVerified: false,
        confidence: 0.45
      }
    ];
    setReports(mockReports);
    setLoading(false);
  };

  const handleVote = (reportId, voteType) => {
    setReports(reports.map(report => {
      if (report.id === reportId) {
        const newReport = { ...report };
        
        // Remove previous vote if exists
        if (report.userVote === 'up') {
          newReport.votes.up--;
        } else if (report.userVote === 'down') {
          newReport.votes.down--;
        }
        
        // Add new vote
        if (voteType === 'up' && report.userVote !== 'up') {
          newReport.votes.up++;
          newReport.userVote = 'up';
        } else if (voteType === 'down' && report.userVote !== 'down') {
          newReport.votes.down++;
          newReport.userVote = 'down';
        } else {
          newReport.userVote = null;
        }
        
        return newReport;
      }
      return report;
    }));
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'ALL') return true;
    return report.status === filter;
  });

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
              <h3><i className="fas fa-list me-2"></i>Community Reports</h3>
              <div className="btn-group" role="group">
                <button 
                  className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('ALL')}
                >
                  All
                </button>
                <button 
                  className={`btn ${filter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFilter('PENDING')}
                >
                  Pending
                </button>
                <button 
                  className={`btn ${filter === 'VERIFIED' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('VERIFIED')}
                >
                  Verified
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredReports.map(report => (
          <div key={report.id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{report.title}</h6>
                <span className={`badge bg-${report.status === 'VERIFIED' ? 'success' : report.status === 'PENDING' ? 'warning' : 'secondary'}`}>
                  {report.status}
                </span>
              </div>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col">
                    <small className="text-muted">
                      <i className="fas fa-user me-1"></i>{report.reporter} • 
                      <i className="fas fa-calendar ms-2 me-1"></i>{report.createdAt}
                    </small>
                  </div>
                </div>
                
                <p className="card-text">{report.description}</p>
                
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-secondary">{report.category}</span>
                  <small className="text-muted">
                    <i className="fas fa-map-marker-alt me-1"></i>{report.location}
                  </small>
                </div>

                {/* AI Verification Badge */}
                {report.aiVerified && (
                  <div className="alert alert-success py-1 mb-2">
                    <small>
                      <i className="fas fa-robot me-1"></i>
                      AI Verified ({(report.confidence * 100).toFixed(0)}% confidence)
                    </small>
                  </div>
                )}

                {/* Community Voting */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="btn-group btn-group-sm" role="group">
                    <button 
                      className={`btn ${report.userVote === 'up' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => handleVote(report.id, 'up')}
                    >
                      <i className="fas fa-thumbs-up me-1"></i>{report.votes.up}
                    </button>
                    <button 
                      className={`btn ${report.userVote === 'down' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handleVote(report.id, 'down')}
                    >
                      <i className="fas fa-thumbs-down me-1"></i>{report.votes.down}
                    </button>
                  </div>
                  
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-eye me-1"></i>View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No reports found</h5>
          <p className="text-muted">Try changing the filter or submit a new report!</p>
        </div>
      )}
    </div>
  );
};

export default ReportList;