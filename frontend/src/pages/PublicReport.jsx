import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { publicAPI } from '../api/client';
import { AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';

export default function PublicReport() {
  const navigate = useNavigate();
  const [showOptional, setShowOptional] = useState(false);
  const [copied, setCopied] = useState(false);
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
    <div className="public-container" style={{ background: '#2c3e50', minHeight: '100vh', padding: '0' }}>
      {/* Header with Tabs */}
      <div style={{ background: '#34495e', padding: '20px 0', borderBottom: '3px solid #27ae60' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '15px', fontSize: '24px' }}>JKUAT Campus Safety Portal</h1>
          <p style={{ color: '#ecf0f1', textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>Report a security concern – your safety matters</p>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button style={{ padding: '12px 30px', background: 'white', color: '#2c3e50', border: 'none', borderRadius: '8px 8px 0 0', fontWeight: '600', cursor: 'pointer' }}>
              Report Incident
            </button>
            <button onClick={() => navigate('/public/status')} style={{ padding: '12px 30px', background: 'transparent', color: '#ecf0f1', border: '1px solid #7f8c8d', borderRadius: '8px 8px 0 0', fontWeight: '600', cursor: 'pointer' }}>
              Track Report
            </button>
            <button style={{ padding: '12px 30px', background: 'transparent', color: '#ecf0f1', border: '1px solid #7f8c8d', borderRadius: '8px 8px 0 0', fontWeight: '600', cursor: 'pointer' }}>
              Safety Tips
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="public-portal-grid" style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        {/* Main Form */}
        <div className="public-box" style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '10px', fontSize: '20px' }}>Report a Security Incident</h2>
          <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '25px' }}>Fill in the details below. All fields marked * are required.</p>

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

            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{showOptional ? 'Hide' : 'Add'} Additional Details (Optional)</span>
                <span>{showOptional ? '▲' : '▼'}</span>
              </button>
            </div>

            {showOptional && (
              <div className="animate-fade-in" style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
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
              </div>
            )}

            {/* Photo Evidence Upload Section */}
            <div style={{ marginTop: '20px', marginBottom: '20px', padding: '25px', border: '2px dashed #3498db', borderRadius: '8px', background: '#f8f9fa', textAlign: 'center' }}>
              <label htmlFor="evidence_upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '14px', color: '#3498db', marginBottom: '8px', fontWeight: '600' }}>
                  📎 Upload photo evidence (JPEG, PNG, PDF - max 10MB)
                </div>
                <input
                  id="evidence_upload"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    console.log('File selected:', e.target.files[0]);
                  }}
                />
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                  Click to browse or drag and drop
                </div>
              </label>
            </div>

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

        {/* Sidebar Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* How it works */}
          <div style={{ background: '#d5f4e6', padding: '20px', borderRadius: '8px', border: '2px solid #27ae60' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <span style={{ fontSize: '16px' }}>✓</span>
              <h3 style={{ fontSize: '16px', color: '#27ae60', margin: 0 }}>How it works</h3>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#2c3e50', fontSize: '13px', lineHeight: '2' }}>
              <li>Fill form</li>
              <li>Submit</li>
              <li>Get Ref #</li>
              <li>Track status</li>
              <li>Stay safe</li>
            </ol>
          </div>

          {/* Emergency Contact */}
          <div style={{ background: '#fef5e7', padding: '20px', borderRadius: '8px', border: '2px solid #f39c12' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>📞</span>
              <h3 style={{ fontSize: '16px', color: '#e67e22', margin: 0 }}>Emergency</h3>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '5px' }}>Security Desk</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>0800-JKUAT-1</div>
              <div style={{ fontSize: '11px', color: '#95a5a6' }}>24/7 Hotline</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
