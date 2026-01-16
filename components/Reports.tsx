import React, { useEffect, useState } from 'react';
import { FileDown, TrendingUp, Calendar } from 'lucide-react';
import { Url } from '../types';
import { urlService } from '../services/urlService';
import { useAuth } from '../contexts/AuthContext';

const Reports: React.FC = () => {
    const { supabaseUser } = useAuth();
    const [urls, setUrls] = useState<Url[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7');

    useEffect(() => {
        const fetchUrls = async () => {
            if (!supabaseUser) return;

            try {
                const data = await urlService.getMyUrls(supabaseUser.id);
                setUrls(data);
            } catch (error) {
                console.error('Erro ao carregar URLs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUrls();
    }, [supabaseUser]);

    const exportCSV = () => {
        const headers = 'Slug,URL Original,Cliques,Status,Criado em\n';
        const rows = urls.map(url =>
            `${url.short_slug},"${url.original_url}",${url.clicks_count},${url.active ? 'Ativo' : 'Inativo'},${new Date(url.created_at).toLocaleDateString('pt-BR')}`
        ).join('\n');

        const csv = headers + rows;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-vaili-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const topLinks = [...urls]
        .sort((a, b) => b.clicks_count - a.clicks_count)
        .slice(0, 10);

    const totalClicks = urls.reduce((sum, url) => sum + url.clicks_count, 0);
    const avgClicksPerLink = urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : '0';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
                    <p className="text-slate-500">Análise detalhada do desempenho dos seus links</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                    </select>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <FileDown size={18} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString()}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Total de Cliques</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{avgClicksPerLink}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Média por Link</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <FileDown size={24} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{urls.length}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Links Criados</div>
                </div>
            </div>

            {/* Top Links Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Top 10 Links Mais Clicados</h3>
                    <p className="text-sm text-slate-500 mt-1">Links com melhor desempenho no período selecionado</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">#</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Link</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Destino</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Cliques</th>
                                <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {topLinks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum link encontrado
                                    </td>
                                </tr>
                            ) : (
                                topLinks.map((url, index) => (
                                    <tr key={url.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-indigo-600">12vai/{url.short_slug}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 truncate max-w-[300px] block">{url.original_url}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full text-xs font-black text-white">
                                                {url.clicks_count.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${url.active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {url.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
