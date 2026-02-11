import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { incidentsAPI, usersAPI } from '../api/client';
import Layout from '../components/Layout';
import { Upload, MessageSquare } from 'lucide-react';

export default function IncidentDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsAPI.get(id).then(res => res.data),
  });

  const { data: guards } = useQuery({
    queryKey: ['guards'],
    queryFn: () => usersAPI.guards().then(res => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => incidentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incident', id]);
      setEditMode(false);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => incidentsAPI.addNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incident', id]);
      setNote('');
    },
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: (formData) => incidentsAPI.uploadEvidence(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['incident', id]);
    },
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate(editData);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (note.trim()) {
      addNoteMutation.mutate({ note });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      uploadEvidenceMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Loading incident...</div>
      </Layout>
    );
  }

  if (!incident) {
    return (
      <Layout>
        <div className="error-message">Incident not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Incident Details</h1>
          <p style={{ color: '#64748b' }}>{incident.reference_number}</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setEditMode(!editMode);
            setEditData({
              status: incident.status,
              severity: incident.severity,
              assigned_to: incident.assigned_to?.id || '',
            });
          }}
        >
          {editMode ? 'Cancel Edit' : 'Edit Incident'}
        </button>
      </div>

      {editMode ? (
        <div className="card">
          <h2>Update Incident</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                value={editData.severity}
                onChange={(e) => setEditData({ ...editData, severity: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign To</label>
              <select
                value={editData.assigned_to}
                onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {guards?.map((guard) => (
                  <option key={guard.id} value={guard.id}>
                    {guard.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Incident Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <p><strong>Type:</strong> {incident.incident_type}</p>
                <p><strong>Title:</strong> {incident.title}</p>
                <p><strong>Status:</strong> <span className={`badge badge-${incident.status}`}>{incident.status}</span></p>
                <p><strong>Severity:</strong> <span className={`badge badge-${incident.severity}`}>{incident.severity}</span></p>
              </div>
              <div>
                <p><strong>Location:</strong> {incident.location_building}</p>
                <p><strong>Floor:</strong> {incident.location_floor || 'N/A'}</p>
                <p><strong>Reported By:</strong> {incident.reported_by_details?.full_name || 'Public'}</p>
                <p><strong>Assigned To:</strong> {incident.assigned_to_details?.full_name || 'Unassigned'}</p>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Description:</strong></p>
              <p>{incident.description}</p>
            </div>
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
              <p>Created: {new Date(incident.created_at).toLocaleString()}</p>
              {incident.resolved_at && <p>Resolved: {new Date(incident.resolved_at).toLocaleString()}</p>}
              {incident.response_time && <p>Response Time: {incident.response_time} hours</p>}
            </div>
          </div>

          <div className="card">
            <h2>Evidence</h2>
            <div>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                <Upload size={16} style={{ marginRight: '8px', display: 'inline' }} />
                Upload Evidence
              </label>
            </div>

            {incident.evidence && incident.evidence.length > 0 ? (
              <div className="evidence-grid">
                {incident.evidence.map((item) => (
                  <div key={item.id} className="evidence-item">
                    {item.file_type === 'pdf' ? (
                      <div style={{ padding: '20px', textAlign: 'center', background: '#f3f4f6' }}>
                        <p>PDF Document</p>
                        <a href={item.file} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '10px', fontSize: '12px' }}>
                          View
                        </a>
                      </div>
                    ) : (
                      <img src={item.file} alt="Evidence" />
                    )}
                    <div style={{ padding: '8px', fontSize: '11px', color: '#64748b' }}>
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', marginTop: '20px' }}>No evidence uploaded</p>
            )}
          </div>

          <div className="card">
            <h2>Notes & Updates</h2>
            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note or update..."
                  style={{ minHeight: '80px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!note.trim() || addNoteMutation.isPending}>
                <MessageSquare size={16} style={{ marginRight: '8px', display: 'inline' }} />
                Add Note
              </button>
            </form>

            <div className="notes-list">
              {incident.notes && incident.notes.length > 0 ? (
                incident.notes.map((item) => (
                  <div key={item.id} className="note-item">
                    <div className="note-header">
                      <span><strong>{item.user_name}</strong></span>
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p>{item.note}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', marginTop: '20px' }}>No notes yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
