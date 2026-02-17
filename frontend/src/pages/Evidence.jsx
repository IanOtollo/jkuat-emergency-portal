import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { Upload, FileText, Image, File } from 'lucide-react';

export default function Evidence() {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');

    const { data: incidents, isLoading } = useQuery({
        queryKey: ['incidents-with-evidence'],
        queryFn: () => incidentsAPI.list({ has_evidence: true }).then(res => res.data.results),
    });

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1>Evidence Management</h1>
                    <p style={{ color: '#64748b' }}>View and manage incident evidence</p>
                </div>
            </div>

            <div className="card">
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontWeight: '600', color: '#475569' }}>Filter:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                        <option value="all">All Evidence</option>
                        <option value="images">Images Only</option>
                        <option value="documents">Documents Only</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="loading">Loading evidence...</div>
                ) : incidents && incidents.length > 0 ? (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {incidents.map((incident) => (
                            <div key={incident.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>{incident.reference_number}</h3>
                                        <p style={{ fontSize: '13px', color: '#64748b' }}>{incident.incident_type} - {incident.location_building}</p>
                                    </div>
                                    <span className={`badge badge-${incident.status}`}>{incident.status}</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                                    {incident.evidence_count > 0 ? (
                                        Array.from({ length: incident.evidence_count }).map((_, idx) => (
                                            <div key={idx} style={{ padding: '15px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                <Image size={32} style={{ color: '#3b82f6', margin: '0 auto 8px' }} />
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>Evidence {idx + 1}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                            No evidence files available
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <FileText size={48} style={{ color: '#cbd5e1', margin: '0 auto 20px' }} />
                        <h3 style={{ color: '#64748b', marginBottom: '10px' }}>No Evidence Found</h3>
                        <p style={{ color: '#94a3b8' }}>No incidents with evidence files at the moment.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
