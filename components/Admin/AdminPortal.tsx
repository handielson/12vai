import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Copy, Check, Users, Wrench, Settings, FileText, Clock, BarChart3, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import { AdminLogin } from './AdminLogin';
import { MaintenanceControl } from './MaintenanceControl';
import AdminDashboard from './AdminDashboard';
import { PlanSettingsPanel } from './PlanSettingsPanel';
import { DocumentationPanel } from './DocumentationPanel';
import { AuditLogPanel } from './AuditLogPanel';


type TabType = 'dashboard' | 'users' | 'maintenance' | 'plans' | 'audit' | 'docs';

const AdminPortal: React.FC = () => {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [linkCopied, setLinkCopied] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, [user]);

    useEffect(() => {
        if (isAdmin) {
            loadStats();
        }
    }, [isAdmin]);

    const checkAdminAccess = async () => {
        // Se não há usuário, mostrar tela de login do admin
        if (!user) {
            setShowLogin(true);
            setLoading(false);
            return;
        }

        try {
            const adminStatus = await adminService.isAdmin(user.id);
            setIsAdmin(adminStatus);

            if (!adminStatus) {
                // Não é admin - fazer logout e mostrar login
                await signOut();
                setShowLogin(true);
                alert('❌ Acesso Negado\n\nApenas administradores podem acessar este portal.');
            } else {
                setShowLogin(false);
            }
        } catch (error) {
            console.error('Erro ao verificar admin:', error);
            setShowLogin(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        setShowLogin(false);
        setLoading(true);
        // Recarregar para pegar novo user do contexto
        window.location.reload();
    };

    const loadStats = async () => {
        try {
            const data = await adminService.getSystemStats();
            setStats(data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const copyAdminLink = () => {
        const adminUrl = `${window.location.origin}/admin`;
        navigator.clipboard.writeText(adminUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleLogout = async () => {
        if (confirm('Deseja sair do Portal Administrativo?')) {
            await signOut();
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Shield className="text-rose-600 mx-auto mb-4 animate-pulse" size={48} />
                    <p className="text-slate-600 font-medium">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    // Se precisa mostrar login, renderizar AdminLogin
    if (showLogin) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    // Se não é admin (e não está mostrando login), não renderizar nada
    if (!isAdmin) {
        return null;
    }

    const tabs = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
        { id: 'users' as TabType, label: 'Usuários', icon: Users },
        { id: 'maintenance' as TabType, label: 'Manutenção', icon: Wrench },
        { id: 'plans' as TabType, label: 'Planos', icon: Settings },
        { id: 'audit' as TabType, label: 'Auditoria', icon: Clock },
        { id: 'docs' as TabType, label: 'Documentação', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Portal Administrativo</h1>
                                <p className="text-xs text-slate-500">VaiEncurta</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* Copy Link Button */}
                            <button
                                onClick={copyAdminLink}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
                                title="Copiar link do portal"
                            >
                                {linkCopied ? (
                                    <>
                                        <Check size={18} className="text-green-600" />
                                        <span className="text-green-600">Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        <span>Copiar Link</span>
                                    </>
                                )}
                            </button>

                            {/* Back to App */}
                            <a
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors font-medium text-sm"
                            >
                                <Zap size={18} />
                                <span>Voltar ao App</span>
                                <ExternalLink size={14} />
                            </a>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-medium text-sm"
                            >
                                <LogOut size={18} />
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 border-b border-slate-200 -mb-px overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-rose-600 text-rose-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Geral</h2>
                            <p className="text-slate-600">Visão geral do sistema VaiEncurta</p>
                        </div>

                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Users size={24} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
                                    <div className="text-sm font-medium text-slate-500 mt-1">Total de Usuários</div>
                                    <div className="mt-3 text-xs text-slate-400">
                                        Free: {stats.freeUsers} | Pro: {stats.proUsers} | Business: {stats.businessUsers}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                            <Zap size={24} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">{stats.totalUrls}</div>
                                    <div className="text-sm font-medium text-slate-500 mt-1">Total de URLs</div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                            <BarChart3 size={24} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</div>
                                    <div className="text-sm font-medium text-slate-500 mt-1">Total de Cliques</div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                            <Settings size={24} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        R$ {((stats.proUsers * 29) + (stats.businessUsers * 99)).toLocaleString()}
                                    </div>
                                    <div className="text-sm font-medium text-slate-500 mt-1">Receita Mensal</div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl p-8 border border-rose-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">🎯 Bem-vindo ao Portal Admin</h3>
                            <p className="text-slate-600 mb-4">
                                Use as abas acima para navegar entre as diferentes funcionalidades administrativas.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>• <strong>Usuários</strong>: Gerencie planos, limites e impersone usuários</li>
                                <li>• <strong>Manutenção</strong>: Ative/desative o modo de manutenção do site</li>
                                <li>• <strong>Planos</strong>: Configure limites e preços dos planos</li>
                                <li>• <strong>Auditoria</strong>: Visualize logs de todas as ações administrativas</li>
                                <li>• <strong>Documentação</strong>: Acesse guias e referências do sistema</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && <AdminDashboard />}
                {activeTab === 'plans' && <PlanSettingsPanel />}
                {activeTab === 'audit' && <AuditLogPanel />}
                {activeTab === 'docs' && <DocumentationPanel />}
                {activeTab === 'maintenance' && <MaintenanceControl />}
            </main>
        </div>
    );
};

export default AdminPortal;
