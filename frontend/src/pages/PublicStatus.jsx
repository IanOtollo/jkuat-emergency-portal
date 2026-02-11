import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicAPI } from '../api/client';
import { Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return <Clock size={48} style={{ color: '#3b82f6' }} />;
      case 'under_investigation':
        return <AlertCircle size={48} style={{ color: '#f59e0b' }} />;
      case 'resolved':
        return <CheckCircle size={48} style={{ color: '#10b981' }} />;
      default:
        return <Clock size={48} style={{ color: '#64748b' }} />;
    }
  };

  return (
    <div className="public-container">
      <div className="public-box">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>Track Your Report</h1>
          <p style={{ color: '#64748b', marginTop: '10px' }}>
            Enter your reference number to check the status
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Reference Number</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
                placeholder="e.g., PUB-2026-00001"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!refNumber}>
                <Search size={18} />
              </button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="loading">Searching...</div>
        )}

        {error && (
          <div className="error-message">
            Report not found. Please check your reference number and try again.
          </div>
        )}

        {status && (
          <div className="card" style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
              {getStatusIcon(status.status)}
            </div>
            
            <h2 style={{ marginBottom: '10px' }}>{status.reference_number}</h2>
            
            <div style={{ fontSize: '18px', marginBottom: '20px' }}>
              <span className={`badge badge-${status.status}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                {status.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {status.incident_status && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '6px' }}>
                <p style={{ marginBottom: '5px', color: '#64748b' }}>Incident Status</p>
                <p style={{ fontWeight: 'bold' }}>{status.incident_status?.replace('_', ' ').toUpperCase()}</p>
                {status.incident_reference && (
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                    Incident Ref: {status.incident_reference}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
              <p>Submitted: {new Date(status.created_at).toLocaleString()}</p>
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
