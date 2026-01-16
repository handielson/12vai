

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  MousePointer2,
  Link as LinkIcon,
  Clock,
  Globe
} from 'lucide-react';
import { DashboardStats } from '../types';
import { urlService } from '../services/urlService';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
          }`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    <div className="text-sm font-medium text-slate-500 mt-1">{title}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabaseUser) return;

      try {
        const data = await urlService.getDashboardStats(supabaseUser.id);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [supabaseUser]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Acompanhe o desempenho dos seus links em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Último ano</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total de Cliques" value={stats.totalClicks.toLocaleString()} change={12.5} icon={MousePointer2} trend="up" />
        <StatCard title="Links Ativos" value={stats.activeUrls} change={4.2} icon={LinkIcon} trend="up" />
        <StatCard title="CTR Médio" value="18.2%" change={1.2} icon={Clock} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tráfego ao Longo do Tempo</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.clicksByDay}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  labelStyle={{ fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="count" name="Cliques" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Dispositivos</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topDevices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.topDevices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stats.topDevices.map((device, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-slate-600">{device.name}</span>
                </div>
                <span className="font-bold text-slate-900">{device.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
