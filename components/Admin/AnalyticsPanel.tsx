import React, { useState, useEffect } from 'react';
import { Link, BarChart3, Users, MousePointerClick } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import StatCard from './StatCard';
import type { GeneralStats, TimeSeriesData, TopUrlData } from '../../types';

export default function AnalyticsPanel() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<GeneralStats>({
        totalUrls: 0,
        totalClicks: 0,
        totalUsers: 0,
        avgClicksPerUrl: 0
    });
    const [urlsOverTime, setUrlsOverTime] = useState<TimeSeriesData[]>([]);
    const [clicksOverTime, setClicksOverTime] = useState<TimeSeriesData[]>([]);
    const [topUrls, setTopUrls] = useState<TopUrlData[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            const [generalStats, urlsData, clicksData, topUrlsData] = await Promise.all([
                analyticsService.getGeneralStats(),
                analyticsService.getUrlsOverTime(30),
                analyticsService.getClicksOverTime(30),
                analyticsService.getTopUrls(10)
            ]);

            setStats(generalStats);
            setUrlsOverTime(urlsData);
            setClicksOverTime(clicksData);
            setTopUrls(topUrlsData);
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
                <p className="text-slate-600 mt-1">Visualização de dados e estatísticas do sistema</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total de URLs"
                    value={stats.totalUrls}
                    icon={<Link size={24} />}
                />
                <StatCard
                    title="Total de Cliques"
                    value={stats.totalClicks}
                    icon={<MousePointerClick size={24} />}
                />
                <StatCard
                    title="Total de Usuários"
                    value={stats.totalUsers}
                    icon={<Users size={24} />}
                />
                <StatCard
                    title="Média de Cliques/URL"
                    value={stats.avgClicksPerUrl}
                    icon={<BarChart3 size={24} />}
                    format="decimal"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* URLs Criadas */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">URLs Criadas (Últimos 30 dias)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={urlsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={2}
                                name="URLs"
                                dot={{ fill: '#6366f1', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Cliques */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Cliques (Últimos 30 dias)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={clicksOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="Cliques"
                                dot={{ fill: '#10b981', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top URLs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Top 10 URLs Mais Clicadas</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topUrls} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                            dataKey="shortCode"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            formatter={(value: number, name: string, props: any) => {
                                return [
                                    value,
                                    'Cliques',
                                    <div className="text-xs text-slate-500 mt-1">
                                        {props.payload.originalUrl.substring(0, 50)}...
                                    </div>
                                ];
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="clicks"
                            fill="#8b5cf6"
                            name="Cliques"
                            radius={[0, 8, 8, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
