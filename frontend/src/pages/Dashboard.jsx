import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => incidentsAPI.dashboardStats().then(res => res.data),
  });

  const { data: recentIncidents } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: () => incidentsAPI.list({ page_size: 5 }).then(res => res.data.results),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Loading your workspace...</div>
      </Layout>
    );
  }

  const getGreeting = () => {
    const roleMap = {
      'guard': 'Officer',
      'supervisor': 'Supervisor',
      'head': 'Chief',
      'admin': 'Administrator'
    };
    return `Welcome back, ${roleMap[user?.role] || 'User'} ${user?.full_name?.split(' ')[0]}`;
  };

  const getSubtext = () => {
    if (user?.role === 'guard') return 'Focus on your assigned tasks and active patrols.';
    if (['supervisor', 'head'].includes(user?.role)) return 'Campus-wide security overview and rapid response monitoring.';
    return 'System-wide monitoring and administrative oversight.';
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>{getGreeting()}</h1>
          <p style={{ color: '#64748b' }}>{getSubtext()}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <div className="value">{stats?.total || 0}</div>
          <FileText size={24} style={{ color: '#3b82f6', marginTop: '10px' }} />
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{stats?.pending || 0}</div>
          <AlertCircle size={24} style={{ color: '#f59e0b', marginTop: '10px' }} />
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="value" style={{ color: '#3b82f6' }}>{stats?.in_progress || 0}</div>
          <Clock size={24} style={{ color: '#3b82f6', marginTop: '10px' }} />
        </div>

        <div className="stat-card">
          <h3>Resolved</h3>
          <div className="value" style={{ color: '#10b981' }}>{stats?.resolved || 0}</div>
          <CheckCircle size={24} style={{ color: '#10b981', marginTop: '10px' }} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>
          {user?.role === 'guard' ? 'My Recent Assignments' : 'Recent Campus Incidents'}
        </h2>
        {recentIncidents && recentIncidents.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.reference_number}</td>
                  <td>{incident.incident_type}</td>
                  <td>{incident.location_building}</td>
                  <td>
                    <span className={`badge badge-${incident.status}`}>
                      {incident.status}
                    </span>
                  </td>
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
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No incidents found</p>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/incidents" className="btn btn-secondary">
            View All Incidents
          </Link>
        </div>
      </div>
    </Layout>
  );
}
