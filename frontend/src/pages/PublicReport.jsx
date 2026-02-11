import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { publicAPI } from '../api/client';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function PublicReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    incident_type: 'theft',
    description: '',
    location_building: '',
    location_floor: '',
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    is_anonymous: false,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => publicAPI.submitReport(data),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (submitMutation.isSuccess) {
    const refNumber = submitMutation.data?.data?.reference_number;
    return (
      <div className="public-container">
        <div className="public-box">
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} style={{ color: '#10b981', margin: '20px auto' }} />
            <h1>Report Submitted Successfully</h1>
            <p style={{ marginTop: '20px', fontSize: '18px' }}>Your reference number is:</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', margin: '20px 0' }}>
              {refNumber}
            </p>
            <p style={{ color: '#64748b' }}>
              Please save this reference number to track your report status.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/public/status')} className="btn btn-primary">
                Track Status
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-container">
      <div className="public-box">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>JKUAT Security Incident Report</h1>
          <p style={{ color: '#64748b', marginTop: '10px' }}>
            Report non-emergency security incidents
          </p>
        </div>

        <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} style={{ color: '#92400e', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '14px', color: '#92400e' }}>
              <strong>Emergency?</strong> For life-threatening situations, call 999 or campus security directly at 0700-000-000
            </div>
          </div>
        </div>

        {submitMutation.isError && (
          <div className="error-message">
            {submitMutation.error?.response?.data?.message || 'Failed to submit report. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Incident Type *</label>
            <select
              value={formData.incident_type}
              onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
              required
            >
              <option value="theft">Theft/Burglary</option>
              <option value="suspicious">Suspicious Activity</option>
              <option value="vandalism">Vandalism</option>
              <option value="lost_found">Lost and Found</option>
              <option value="noise">Noise Complaint</option>
              <option value="facility">Facility Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              required
            />
          </div>

          <div className="form-group">
            <label>Location Building *</label>
            <input
              type="text"
              value={formData.location_building}
              onChange={(e) => setFormData({ ...formData, location_building: e.target.value })}
              placeholder="e.g., Main Library, Student Hostels Block A"
              required
            />
          </div>

          <div className="form-group">
            <label>Floor/Room</label>
            <input
              type="text"
              value={formData.location_floor}
              onChange={(e) => setFormData({ ...formData, location_floor: e.target.value })}
              placeholder="e.g., Floor 2, Room 204"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                style={{ width: 'auto' }}
              />
              Report Anonymously
            </label>
          </div>

          {!formData.is_anonymous && (
            <>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={formData.reporter_name}
                  onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.reporter_email}
                  onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.reporter_phone}
                  onChange={(e) => setFormData({ ...formData, reporter_phone: e.target.value })}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <a href="/public/status" style={{ color: '#3b82f6' }}>Track Report Status</a>
            {' | '}
            <a href="/login" style={{ color: '#3b82f6' }}>Security Personnel Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
