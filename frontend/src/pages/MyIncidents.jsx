import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { FileText, Clock, AlertCircle } from 'lucide-react';

export default function MyIncidents() {
    const { user } = useAuth();

    const { data: incidents, isLoading } = useQuery({
        queryKey: ['my-incidents'],
        queryFn: () => incidentsAPI.list({ assigned_to: user?.id }).then(res => res.data.results),
    });

    return (
        <Layout>
            <div className="page-header">
                <h1>My Assigned Incidents</h1>
                <p style={{ color: '#64748b' }}>Incidents currently assigned to you</p>
            </div>

            {isLoading ? (
                <div className="loading">Loading your assignments...</div>
            ) : incidents && incidents.length > 0 ? (
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map((incident) => (
                                <tr key={incident.id}>
                                    <td>{incident.reference_number}</td>
                                    <td>{incident.incident_type}</td>
                                    <td>{incident.location_building}</td>
                                    <td>
                                        <span className={`badge badge-${incident.status}`}>
                                            {incident.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${incident.priority}`}>
                                            {incident.priority}
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
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 20px' }} />
                    <h3 style={{ color: '#64748b', marginBottom: '10px' }}>No Assigned Incidents</h3>
                    <p style={{ color: '#94a3b8' }}>You don't have any incidents assigned to you at the moment.</p>
                </div>
            )}
        </Layout>
    );
}
