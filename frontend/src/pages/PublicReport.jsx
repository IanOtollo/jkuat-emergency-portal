import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { publicAPI } from '../api/client';
import { AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';

export default function PublicReport() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    // ... (lines 10-18 remain same)
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (submitMutation.isSuccess) {
    const refNumber = submitMutation.data?.data?.reference_number;
    return (
      <div className="public-container">
        <div className="public-box animate-fade-in">
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#d1fae5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={48} style={{ color: '#10b981' }} />
            </div>
            <h1 style={{ color: '#065f46' }}>Submission Received</h1>
            <p style={{ marginTop: '20px', fontSize: '16px', color: '#64748b' }}>Technical Reference Number:</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              margin: '15px 0'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', letterSpacing: '1px' }}>
                {refNumber}
              </span>
              <button
                onClick={() => copyToClipboard(refNumber)}
                className="copy-button"
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
              Please keep this number safe. You will need it to track the status of your report.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button onClick={() => navigate('/public/status')} className="btn btn-primary" style={{ fontWeight: '600' }}>
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
            <label htmlFor="incident_type">Incident Type *</label>
            <select
              id="incident_type"
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
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location_building">Location Building *</label>
            <input
              id="location_building"
              type="text"
              value={formData.location_building}
              onChange={(e) => setFormData({ ...formData, location_building: e.target.value })}
              placeholder="e.g., Main Library, Student Hostels Block A"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location_floor">Floor/Room</label>
            <input
              id="location_floor"
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
                aria-label="Report Anonymously"
                style={{ width: 'auto' }}
              />
              Report Anonymously
            </label>
          </div>

          {!formData.is_anonymous && (
            <>
              <div className="form-group">
                <label htmlFor="reporter_name">Your Name</label>
                <input
                  id="reporter_name"
                  type="text"
                  value={formData.reporter_name}
                  onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reporter_email">Email</label>
                <input
                  id="reporter_email"
                  type="email"
                  value={formData.reporter_email}
                  onChange={(e) => setFormData({ ...formData, reporter_email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reporter_phone">Phone</label>
                <input
                  id="reporter_phone"
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
