import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

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
        <div className="loading">Analyzing security data...</div>
      </Layout>
    );
  }

  const typeData = Object.entries(stats?.by_type || {}).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value
  }));

  const severityData = Object.entries(advanced?.by_severity || {}).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  const trendData = (advanced?.trends || []).map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: item.count
  }));

  const hourData = (advanced?.by_hour || []).map(item => ({
    name: `${item.hour}:00`,
    count: item.count
  }));

  const locationData = (advanced?.by_location || []).slice(0, 8);

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Shield size={32} style={{ color: '#3b82f6' }} />
          <div>
            <h1>Security Intelligence Dashboard</h1>
            <p style={{ color: '#64748b' }}>Comprehensive analysis of JKUAT campus safety and response efficiency</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Total Reports</h3>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
          </div>
          <div className="value">{stats?.total || 0}</div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Cumulative incidents</p>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Active Cases</h3>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div className="value" style={{ color: '#f59e0b' }}>
            {(stats?.pending || 0) + (stats?.assigned || 0) + (stats?.in_progress || 0)}
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Requiring action</p>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Resolution Efficiency</h3>
            <CheckCircle size={16} style={{ color: '#3b82f6' }} />
          </div>
          <div className="value" style={{ color: '#3b82f6' }}>
            {advanced?.avg_resolution_hours || 0}h
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Avg response time</p>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Success Rate</h3>
            <Shield size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="value" style={{ color: '#8b5cf6' }}>
            {stats?.total > 0 ? Math.round(((advanced?.resolved_count || 0) / stats.total) * 100) : 0}%
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Resolved vs Total</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '25px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Incident Trends (Last 30 Days)</h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Daily frequency analysis</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Category Breakdown</h2>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Incident types distribution</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
        <div className="card">
          <h2><MapPin size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Building Hotspots</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} hide />
              <YAxis dataKey="location" type="category" fontSize={10} width={80} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2><Clock size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Hourly Peak Periods</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} interval={3} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                innerRadius={0}
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'HIGH' ? '#ef4444' : entry.name === 'MEDIUM' ? '#f59e0b' : '#10b981'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
