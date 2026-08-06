import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, FileText, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

const mockData = [
  { name: 'Mon', docs: 400, users: 240 },
  { name: 'Tue', docs: 300, users: 139 },
  { name: 'Wed', docs: 550, users: 980 },
  { name: 'Thu', docs: 278, users: 390 },
  { name: 'Fri', docs: 189, users: 480 },
  { name: 'Sat', docs: 239, users: 380 },
  { name: 'Sun', docs: 349, users: 430 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Admin Overview</h1>
        <p className="text-[13px] text-[#9B9490] mt-0.5">
          System telemetry, user management, and verification analytics
        </p>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { title: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { title: 'Total Documents', value: '14,293', icon: FileText, color: 'text-[#2D6A4F]', bg: 'bg-[#F0FAF5] border-[#C3DDD0]' },
          { title: 'Pending Verifications', value: '84', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { title: 'Fraud Alerts', value: '3', icon: ShieldAlert, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9B9490]">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-[#2D2A27] mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9490]">Document Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9B9490" fontSize={11} />
                <YAxis stroke="#9B9490" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9E4DD', color: '#2D2A27', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="docs" stroke="#2D6A4F" strokeWidth={2} fillOpacity={1} fill="url(#colorDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9490]">User Registrations</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis dataKey="name" stroke="#9B9490" fontSize={11} />
                <YAxis stroke="#9B9490" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E9E4DD', color: '#2D2A27', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="users" fill="#B5883D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── System Health ── */}
      <div className="p-5 bg-white border border-[#E9E4DD] rounded-xl shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9490]">System Infrastructure Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['API Server Gateway', 'MongoDB Production', 'Polygon Amoy Storage'].map((sys, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#F0FAF5] border border-[#C3DDD0] flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#2D6A4F] animate-pulse" />
              <div>
                <p className="text-xs font-bold text-[#2D2A27]">{sys}</p>
                <p className="text-[11px] font-semibold text-[#2D6A4F]">Healthy • 99.9% Uptime</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
