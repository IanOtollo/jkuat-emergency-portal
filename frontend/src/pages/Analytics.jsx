import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => incidentsAPI.dashboardStats().then(res => res.data),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Loading analytics...</div>
      </Layout>
    );
  }

  const typeData = Object.entries(stats?.by_type || {}).map(([name, value]) => ({ name, value }));
  const severityData = Object.entries(stats?.by_severity || {}).map(([name, value]) => ({ name, value }));

  return (
    <Layout>
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p style={{ color: '#64748b' }}>Insights from incident data</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <div className="value">{stats?.total || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{stats?.pending || 0}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="value" style={{ color: '#3b82f6' }}>{stats?.in_progress || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <div className="value" style={{ color: '#10b981' }}>{stats?.resolved || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2>Incidents by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Incidents by Severity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
