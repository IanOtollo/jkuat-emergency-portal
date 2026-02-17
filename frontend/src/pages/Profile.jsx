import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import Layout from '../components/Layout';
import { User, Mail, Phone, Shield, Calendar, CheckCircle } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const updateMutation = useMutation({
        mutationFn: (data) => authAPI.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile']);
            setIsEditing(false);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    return (
        <Layout>
            <div className="page-header">
                <h1>My Profile</h1>
                <p style={{ color: '#64748b' }}>Manage your account information</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* Profile Card */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={60} style={{ color: 'white' }} />
                    </div>
                    <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>{user?.full_name}</h2>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: '#dbeafe', borderRadius: '20px', fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '15px' }}>
                        <Shield size={14} />
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '15px' }}>
                        <Calendar size={14} />
                        Joined {new Date(user?.date_joined || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </div>

                {/* Profile Details */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2>Account Information</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {updateMutation.isSuccess && (
                        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={18} />
                            Profile updated successfully!
                        </div>
                    )}

                    {updateMutation.isError && (
                        <div className="error-message" style={{ marginBottom: '20px' }}>
                            Failed to update profile. Please try again.
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="full_name">Full Name</label>
                                <input
                                    id="full_name"
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                                    <User size={20} style={{ color: '#3b82f6' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '3px' }}>Full Name</div>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>{user?.full_name}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                                    <Mail size={20} style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '3px' }}>Email Address</div>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>{user?.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                                    <Phone size={20} style={{ color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '3px' }}>Phone Number</div>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>{user?.phone || 'Not provided'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                                    <Shield size={20} style={{ color: '#8b5cf6' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '3px' }}>Role</div>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b' }}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
