import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '../api/client';
import { Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const getStatusStep = (status) => {
  switch (status) {
    case 'received': return 0;
    case 'under_investigation': return 1;
    case 'resolved': return 2;
    default: return 0;
  }
};

const StatusStepper = ({ currentStatus }) => {
  const steps = ['Received', 'Investigating', 'Resolved'];
  const activeStep = getStatusStep(currentStatus);

  return (
    <div className="stepper">
      {steps.map((label, index) => (
        <div key={label} className={`step ${index <= activeStep ? (index < activeStep ? 'completed' : 'active') : ''}`}>
          <div className="step-circle">
            {index < activeStep ? '✓' : index + 1}
          </div>
          <div className="step-label">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default function PublicStatus() {
  const [refNumber, setRefNumber] = useState('');
  const [searchRef, setSearchRef] = useState('');

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['public-status', searchRef],
    queryFn: () => publicAPI.checkStatus(searchRef).then(res => res.data),
    enabled: !!searchRef,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchRef(refNumber);
  };

  return (
    <div className="public-container">
      <div className="public-box animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1e293b' }}>Track Your Report</h1>
          <p style={{ color: '#64748b', marginTop: '10px' }}>
            Monitor the progress of your security submission
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label style={{ color: '#475569', fontSize: '14px' }}>Reference Number</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
                placeholder="e.g., PUB-2026-00001"
                style={{ flex: 1, border: '2px solid #e2e8f0', height: '45px' }}
              />
              <button type="submit" className="btn btn-primary" disabled={!refNumber} style={{ width: '60px' }}>
                <Search size={20} />
              </button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="loading">Retrieving report status...</div>
        )}

        {error && (
          <div className="error-message" style={{ border: '1px solid #fecaca' }}>
            <AlertCircle size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
            Report not found. Please verify your reference number.
          </div>
        )}

        {status && (
          <div className="card" style={{ marginTop: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{status.reference_number}</span>
              <span className={`badge badge-${status.status}`}>
                {status.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <StatusStepper currentStatus={status.status} />

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report Details</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Type</p>
                  <p style={{ fontWeight: '500' }}>{status.incident_type?.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Submitted On</p>
                  <p style={{ fontWeight: '500' }}>{new Date(status.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {status.incident_status && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '13px' }}>Current Official Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.status === 'resolved' ? '#10b981' : '#3b82f6' }}></div>
                    <p style={{ fontWeight: 'bold', color: '#1e293b' }}>{status.incident_status?.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  {status.incident_reference && (
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                      Official Case Ref: {status.incident_reference}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px' }}>
          <a href="/public" style={{ color: '#3b82f6' }}>Submit New Report</a>
          {' | '}
          <a href="/login" style={{ color: '#3b82f6' }}>Security Personnel Login</a>
        </div>
      </div>
    </div>
  );
}
