import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { incidentsAPI, usersAPI } from '../api/client';
import Layout from '../components/Layout';

export default function CreateIncident() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    incident_type: 'theft',
    title: '',
    description: '',
    location_building: '',
    location_floor: '',
    location_details: '',
    severity: 'medium',
    assigned_to: '',
  });

  const canAssign = ['supervisor', 'head', 'admin'].includes(user?.role);

  const { data: guards } = useQuery({
    queryKey: ['guards'],
    queryFn: () => usersAPI.guards().then(res => res.data),
    enabled: canAssign,
  });

  const createMutation = useMutation({
    mutationFn: (data) => incidentsAPI.create(data),
    onSuccess: (response) => {
      navigate(`/incidents/${response.data.id}`);
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Failed to create incident. Please check your inputs.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Create New Incident</h1>
      </div>

      <div className="card">
        {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}
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
              <option value="traffic">Traffic Incident</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <label>Floor/Zone</label>
            <input
              type="text"
              value={formData.location_floor}
              onChange={(e) => setFormData({ ...formData, location_floor: e.target.value })}
              placeholder="e.g., Floor 2, Room 204"
            />
          </div>

          <div className="form-group">
            <label>Location Details</label>
            <textarea
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              placeholder="Additional location information..."
              style={{ minHeight: '60px' }}
            />
          </div>

          <div className="form-group">
            <label>Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {canAssign && (
            <div className="form-group">
              <label>Assign To</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {guards?.map((guard) => (
                  <option key={guard.id} value={guard.id}>
                    {guard.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Incident'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/incidents')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
