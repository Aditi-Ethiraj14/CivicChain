import React, { useState, useRef } from 'react';
import axios from 'axios';

const ReportForm = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'POTHOLE',
    description: '',
    location: '',
    latitude: null,
    longitude: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiVerification, setAiVerification] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const categories = [
    'POTHOLE', 'GARBAGE', 'STREETLIGHT', 'FLOOD', 'TRAFFIC', 'VANDALISM', 'OTHER'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    // Auto-verify with AI when image is selected
    if (file && file.type.startsWith('image/')) {
      verifyWithAI(file);
    }
  };

  const verifyWithAI = async (file) => {
    try {
      const formDataAI = new FormData();
      formDataAI.append('image_file', file);
      formDataAI.append('category', formData.category);

      // This would normally call the ML service
      // Simulating AI verification for demo
      setTimeout(() => {
        const mockVerification = {
          ai_verified: Math.random() > 0.3, // 70% chance of verification
          confidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
          prediction: `${formData.category} detected`,
          category_match: Math.random() > 0.2,
          details: {
            reported_category: formData.category,
            top_predictions: [
              { class: formData.category.toLowerCase(), confidence: Math.random() * 0.3 + 0.7 }
            ]
          }
        };
        setAiVerification(mockVerification);
      }, 2000);

    } catch (error) {
      console.error('AI verification failed:', error);
      setAiVerification({
        ai_verified: false,
        confidence: 0,
        prediction: 'Verification failed',
        category_match: false
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          });
        },
        (error) => {
          setError('Unable to get location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      setError('Unable to access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const reportData = {
        ...formData,
        reporterId: user.id,
        aiVerified: aiVerification?.ai_verified || false,
        aiConfidence: aiVerification?.confidence || 0
      };

      // In a real app, this would submit to the backend
      console.log('Submitting report:', reportData);
      
      // Simulate API call
      setTimeout(() => {
        setSuccess('Report submitted successfully! It will be reviewed by our team.');
        setFormData({
          title: '',
          category: 'POTHOLE',
          description: '',
          location: '',
          latitude: null,
          longitude: null
        });
        setSelectedFile(null);
        setAiVerification(null);
        setAudioURL('');
        setLoading(false);
      }, 1000);

    } catch (error) {
      setError('Failed to submit report. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3><i className="fas fa-plus-circle me-2"></i>Submit New Report</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label htmlFor="title" className="form-label">Report Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="category" className="form-label">Category *</label>
                    <select
                      className="form-control"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Detailed description of the civic issue"
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location or use GPS"
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={getCurrentLocation}
                    >
                      <i className="fas fa-map-marker-alt me-2"></i>Get GPS Location
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-3">
                  <label htmlFor="file" className="form-label">
                    <i className="fas fa-camera me-2"></i>Upload Image/Video
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <small className="text-success">
                      <i className="fas fa-check me-1"></i>
                      Selected: {selectedFile.name}
                    </small>
                  )}
                </div>

                {/* AI Verification Status */}
                {aiVerification && (
                  <div className={`alert ${aiVerification.ai_verified ? 'alert-success' : 'alert-warning'} mb-3`}>
                    <h6>
                      <i className={`fas ${aiVerification.ai_verified ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                      AI Verification
                    </h6>
                    <p className="mb-1">
                      <strong>Status:</strong> {aiVerification.ai_verified ? 'Verified' : 'Needs Review'}<br/>
                      <strong>Confidence:</strong> {(aiVerification.confidence * 100).toFixed(1)}%<br/>
                      <strong>Detected:</strong> {aiVerification.prediction}
                    </p>
                  </div>
                )}

                {/* Voice Recording */}
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-microphone me-2"></i>Voice Note (Optional)
                  </label>
                  <div className="d-flex gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={startRecording}
                      >
                        <i className="fas fa-microphone me-1"></i>Start Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={stopRecording}
                      >
                        <i className="fas fa-stop me-1"></i>Stop Recording
                      </button>
                    )}
                    
                    {audioURL && (
                      <audio controls src={audioURL} className="flex-grow-1">
                        Your browser does not support audio.
                      </audio>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.history.back()}
                  >
                    <i className="fas fa-arrow-left me-2"></i>Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;