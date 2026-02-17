import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../api/client';
import Layout from '../components/Layout';
import { UserPlus, Mail, Shield, Trash2 } from 'lucide-react';

export default function Users() {
    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersAPI.list().then(res => res.data),
    });

    return (
        <Layout>
            <div className="page-header">
                <h1>User Management</h1>
                <button className="btn btn-primary" onClick={() => alert('Add user feature coming soon!')}>
                    <UserPlus size={18} style={{ marginRight: '8px', display: 'inline' }} />
                    Add New User
                </button>
            </div>

            <div className="card">
                {isLoading ? (
                    <div className="loading">Loading staff directory...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((u) => (
                                <tr key={u.id}>
                                    <td><strong>{u.full_name}</strong></td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge badge-${u.role}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '11px', marginRight: '5px' }}>Edit</button>
                                        {u.role !== 'admin' && (
                                            <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '11px' }}>Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
}
