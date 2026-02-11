import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => incidentsAPI.dashboardStats().then(res => res.data),
  });

  const { data: advanced, isLoading: isAdvancedLoading } = useQuery({
    queryKey: ['advanced-analytics'],
    queryFn: () => incidentsAPI.advancedAnalytics().then(res => res.data),
  });

  if (isStatsLoading || isAdvancedLoading) {
    return (
      <Layout>
        <div className="loading">Loading detailed security reports...</div>
      </Layout>
    );
  }

  const typeData = Object.entries(stats?.by_type || {}).map(([name, value]) => ({ name, value }));
  const hourData = (advanced?.by_hour || []).map(item => ({
    name: `${item.hour}:00`,
    count: item.count
  }));
  const locationData = (advanced?.by_location || []).slice(0, 5); // Top 5 locations

  return (
    <Layout>
      <div className="page-header">
        <h1>Detailed Security Analysis</h1>
        <p style={{ color: '#64748b' }}>Frequency patterns and location hotspots at JKUAT</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <div className="value">{stats?.total || 0}</div>
        </div>
        <div className="stat-card">
          <h3>High Severity</h3>
          <div className="value" style={{ color: '#ef4444' }}>
            {Object.entries(stats?.by_severity || {}).find(([k]) => k === 'high')?.[1] || 0}
          </div>
        </div>
        <div className="stat-card">
          <h3>Most Common Type</h3>
          <div className="value" style={{ fontSize: '1.2rem', color: '#3b82f6' }}>
            {typeData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Primary Hotspot</h3>
          <div className="value" style={{ fontSize: '1.2rem', color: '#8b5cf6' }}>
            {locationData[0]?.location || 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <h2>Incident Frequency by Time (24h)</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Analysis of when security breaches are most likely to occur.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2>Location Distribution</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Top incident hotspots on campus.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="location" type="category" width={100} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>State of Security Summary</h2>
          <div style={{ padding: '10px 0' }}>
            <div className="security-summary-item" style={{ marginBottom: '15px' }}>
              <strong style={{ display: 'block', fontSize: '14px' }}>Temporal Analysis:</strong>
              <p style={{ fontSize: '13px', margin: '5px 0' }}>
                {stats?.total > 0
                  ? "Based on current data, monitoring should be prioritized during peak frequency hours shown above."
                  : "No temporal patterns detected yet. Awaiting more reported incidents for analysis."}
              </p>
            </div>
            <div className="security-summary-item">
              <strong style={{ display: 'block', fontSize: '14px' }}>Spatial Hotspots:</strong>
              <p style={{ fontSize: '13px', margin: '5px 0' }}>
                {locationData.length > 0
                  ? `High frequency of reports observed in ${locationData[0].location}. Strategic patrol deployment recommended.`
                  : "Scanning for geographical clusters... No hotspots identified yet."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
