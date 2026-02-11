import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';

export default function Incidents() {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentsAPI.list(filters).then(res => res.data),
  });

  const incidents = data?.results || [];

  return (
    <Layout>
      <div className="page-header">
        <h1>All Incidents</h1>
        <Link to="/incidents/new" className="btn btn-primary">
          Create New Incident
        </Link>
      </div>

      <div className="card">
        <div className="filters">
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            <option value="theft">Theft</option>
            <option value="suspicious">Suspicious Activity</option>
            <option value="vandalism">Vandalism</option>
            <option value="lost_found">Lost & Found</option>
            <option value="noise">Noise Complaint</option>
            <option value="facility">Facility Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Loading incidents...</div>
        ) : incidents.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td><strong>{incident.reference_number}</strong></td>
                  <td>{incident.title}</td>
                  <td>{incident.incident_type}</td>
                  <td>{incident.location_building}</td>
                  <td>
                    <span className={`badge badge-${incident.status}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${incident.severity}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td>{incident.assigned_to_name || 'Unassigned'}</td>
                  <td>{new Date(incident.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/incidents/${incident.id}`} className="btn btn-primary" style={{ padding: '5px 15px', fontSize: '12px' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No incidents found</p>
        )}
      </div>
    </Layout>
  );
}
