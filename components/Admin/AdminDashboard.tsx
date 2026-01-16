import React, { useEffect, useState } from 'react';
import { Users, Zap, Crown, Link as LinkIcon, MousePointer2, Edit2, Check, X, UserCog, Settings, FileText, Clock, Wrench, Trash2, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { adminService, SystemStats, UserWithStats } from '../../services/adminService';
import { getPlanName, formatLimit, getUrlLimit } from '../../lib/planLimits';
import { useAuth } from '../../contexts/AuthContext';
import { PlanSettingsPanel } from './PlanSettingsPanel';
import { DocumentationPanel } from './DocumentationPanel';
import { AuditLogPanel } from './AuditLogPanel';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editPlan, setEditPlan] = useState('');
    const [editLimit, setEditLimit] = useState('');
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'docs' | 'audit'>('users');

    // Filtros e busca
    const [searchQuery, setSearchQuery] = useState('');
    const [planFilter, setPlanFilter] = useState<string>('all');
    const [adminFilter, setAdminFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'email' | 'plan'>('date');

    // Modo de manutenção
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loadingMaintenance, setLoadingMaintenance] = useState(false);

    // Modal de exclusão
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserWithStats | null>(null);
    const [deleteUrls, setDeleteUrls] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const { impersonateUser: switchUser, user } = useAuth();

    useEffect(() => {
        loadData();
        loadMaintenanceStatus();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, usersData] = await Promise.all([
                adminService.getSystemStats(),
                adminService.getAllUsers()
            ]);
            setStats(statsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMaintenanceStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single();

            if (data && !error) {
                setMaintenanceMode(data.value.enabled);
            }
        } catch (error) {
            console.error('Erro ao carregar status de manutenção:', error);
        }
    };

    const toggleMaintenance = async () => {
        const newStatus = !maintenanceMode;
        const confirmMessage = newStatus
            ? 'Ativar modo de manutenção?\n\nO site ficará inacessível para todos os usuários (exceto admins).'
            : 'Desativar modo de manutenção?\n\nO site voltará a ficar acessível para todos.';

        if (!confirm(confirmMessage)) return;

        setLoadingMaintenance(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .update({
                    value: {
                        enabled: newStatus,
                        message: 'Estamos em manutenção. Voltaremos em breve!'
                    },
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                })
                .eq('key', 'maintenance_mode');

            if (!error) {
                setMaintenanceMode(newStatus);
                alert(newStatus
                    ? '✅ Modo de manutenção ATIVADO!\n\nO site agora mostra a página de manutenção para visitantes.'
                    : '✅ Modo de manutenção DESATIVADO!\n\nO site voltou ao normal.');
            } else {
                throw error;
            }
        } catch (error: any) {
            alert('❌ Erro ao alterar modo de manutenção: ' + error.message);
        } finally {
            setLoadingMaintenance(false);
        }
    };

    const startEdit = (user: UserWithStats) => {
        setEditingUser(user.id);
        setEditPlan(user.plan);
        setEditLimit(user.custom_url_limit?.toString() || '');
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setEditPlan('');
        setEditLimit('');
    };

    const saveEdit = async (userId: string) => {
        setSaving(true);
        try {
            // Buscar dados atuais do usuário para audit log
            const currentUser = users.find(u => u.id === userId);
            if (!currentUser) throw new Error('Usuário não encontrado');

            const oldPlan = currentUser.plan;
            const oldLimit = currentUser.custom_url_limit;

            // Atualizar plano
            await adminService.updateUserPlan(
                userId,
                editPlan,
                user!.id, // admin ID
                currentUser.email,
                oldPlan
            );

            // Atualizar limite
            const limitValue = editLimit ? parseInt(editLimit) : null;
            await adminService.setCustomLimit(
                userId,
                limitValue,
                user!.id, // admin ID
                currentUser.email,
                oldLimit
            );

            await loadData();
            setEditingUser(null);
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImpersonate = async (user: UserWithStats) => {
        if (confirm(`Deseja logar como ${user.email}?\n\nVocê será redirecionado para a conta deste usuário. Para voltar, faça logout e login novamente com sua conta admin.`)) {
            try {
                await switchUser(user.id);
                window.location.reload(); // Recarrega para aplicar nova sessão
            } catch (error: any) {
                alert('Erro ao trocar de usuário: ' + error.message);
            }
        }
    };

    const openDeleteModal = (userToDelete: UserWithStats) => {
        setUserToDelete(userToDelete);
        setDeleteModalOpen(true);
        setDeleteConfirmText('');
        setDeleteUrls(false);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete || !user) return;

        // Validar confirmação
        if (deleteConfirmText !== 'EXCLUIR') {
            alert('Digite "EXCLUIR" para confirmar a exclusão');
            return;
        }

        // Não permitir excluir a si mesmo
        if (userToDelete.id === user.id) {
            alert('Você não pode excluir sua própria conta!');
            return;
        }

        setDeleting(true);
        try {
            await adminService.deleteUser(
                userToDelete.id,
                deleteUrls,
                user.id,
                userToDelete.email
            );

            alert(`✅ Usuário ${userToDelete.email} excluído com sucesso!`);
            setDeleteModalOpen(false);
            setUserToDelete(null);
            await loadData();
        } catch (error: any) {
            alert('❌ Erro ao excluir usuário:\n\n' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleBlockUser = async (userToBlock: UserWithStats) => {
        if (!confirm(`🔒 Bloquear usuário ${userToBlock.email}?\n\nO usuário não poderá fazer login até ser desbloqueado.\nTodos os dados serão mantidos.`)) {
            return;
        }

        try {
            await adminService.blockUser(userToBlock.id, user!.id, userToBlock.email);
            alert(`✅ Usuário ${userToBlock.email} bloqueado com sucesso!`);
            await loadData();
        } catch (error: any) {
            alert('❌ Erro ao bloquear usuário:\n\n' + error.message);
        }
    };

    const handleUnblockUser = async (userToUnblock: UserWithStats) => {
        if (!confirm(`🔓 Desbloquear usuário ${userToUnblock.email}?\n\nO usuário poderá fazer login novamente.`)) {
            return;
        }

        try {
            await adminService.unblockUser(userToUnblock.id, user!.id, userToUnblock.email);
            alert(`✅ Usuário ${userToUnblock.email} desbloqueado com sucesso!`);
            await loadData();
        } catch (error: any) {
            alert('❌ Erro ao desbloquear usuário:\n\n' + error.message);
        }
    };

    // Filtrar e ordenar usuários
    const filteredUsers = users
        .filter(user => {
            // Busca por email
            if (searchQuery && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Filtro por plano
            if (planFilter !== 'all' && user.plan !== planFilter) {
                return false;
            }
            // Filtro por admin
            if (adminFilter === 'admin' && !user.is_admin) {
                return false;
            }
            if (adminFilter === 'user' && user.is_admin) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortBy === 'email') {
                return a.email.localeCompare(b.email);
            }
            if (sortBy === 'plan') {
                return a.plan.localeCompare(b.plan);
            }
            return 0;
        });

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
                    <p className="text-slate-500">Gerencie usuários e visualize estatísticas do sistema</p>
                </div>

                {/* Botão de Manutenção */}
                <button
                    onClick={toggleMaintenance}
                    disabled={loadingMaintenance}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${maintenanceMode
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        }`}
                >
                    <Wrench className={loadingMaintenance ? 'animate-spin' : ''} size={20} />
                    {loadingMaintenance ? 'Alterando...' : maintenanceMode ? '🔴 Desativar Manutenção' : '🟢 Ativar Manutenção'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'users'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={18} />
                        Usuários
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('plans')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'plans'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Settings size={18} />
                        Configurações de Planos
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('docs')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'docs'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        Documentação
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'audit'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        Auditoria
                    </div>
                </button>
            </div>

            {/* Content */}
            {activeTab === 'users' && (
                <>
                    {/* System Stats */}
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
                                        <LinkIcon size={24} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{stats.totalUrls}</div>
                                <div className="text-sm font-medium text-slate-500 mt-1">Total de URLs</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                        <MousePointer2 size={24} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</div>
                                <div className="text-sm font-medium text-slate-500 mt-1">Total de Cliques</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                        <Crown size={24} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-900">
                                    R$ {((stats.proUsers * 29) + (stats.businessUsers * 99)).toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-slate-500 mt-1">Receita Mensal</div>
                            </div>
                        </div>
                    )}

                    {/* User Management */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Gestão de Usuários</h3>
                                <p className="text-sm text-slate-500 mt-1">Gerencie planos e limites de todos os usuários</p>
                            </div>
                        </div>

                        {/* Filtros e Busca */}
                        <div className="p-6">
                            <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
                                {/* Busca */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar por email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Filtros */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <select
                                        value={planFilter}
                                        onChange={(e) => setPlanFilter(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">Todos os Planos</option>
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="business">Business</option>
                                    </select>

                                    <select
                                        value={adminFilter}
                                        onChange={(e) => setAdminFilter(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">Todos os Usuários</option>
                                        <option value="admin">Apenas Admins</option>
                                        <option value="user">Apenas Usuários</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="date">Ordenar por Data</option>
                                        <option value="email">Ordenar por Email</option>
                                        <option value="plan">Ordenar por Plano</option>
                                    </select>

                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setPlanFilter('all');
                                            setAdminFilter('all');
                                            setSortBy('date');
                                        }}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>

                                {/* Contador */}
                                <div className="text-sm text-slate-600">
                                    Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuários
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Plano</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">URLs</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Limite Personalizado</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Cliques</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Cadastro</th>
                                        <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900">{user.email}</span>
                                                    {user.is_admin && (
                                                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                    {user.is_blocked && (
                                                        <span className="px-2 py-0.5 bg-slate-700 text-white text-xs font-bold rounded flex items-center gap-1">
                                                            <Lock size={12} />
                                                            BLOQUEADO
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUser === user.id ? (
                                                    <select
                                                        value={editPlan}
                                                        onChange={(e) => setEditPlan(e.target.value)}
                                                        className="px-3 py-1 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="pro">Pro</option>
                                                        <option value="business">Business</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${user.plan === 'free' ? 'bg-slate-100 text-slate-700' :
                                                        user.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {getPlanName(user.plan)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {user.url_count} / {formatLimit(getUrlLimit(user.plan, user.custom_url_limit))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {editingUser === user.id ? (
                                                    <input
                                                        type="number"
                                                        value={editLimit}
                                                        onChange={(e) => setEditLimit(e.target.value)}
                                                        placeholder="Padrão"
                                                        className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-slate-600">
                                                        {user.custom_url_limit || '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-medium text-slate-900">{user.total_clicks.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-slate-600">
                                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {editingUser === user.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => saveEdit(user.id)}
                                                                disabled={saving}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                disabled={saving}
                                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEdit(user)}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="Editar usuário"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleImpersonate(user)}
                                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title="Logar como este usuário"
                                                            >
                                                                <UserCog size={18} />
                                                            </button>
                                                            {user.is_blocked ? (
                                                                <button
                                                                    onClick={() => handleUnblockUser(user)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Desbloquear usuário"
                                                                >
                                                                    <Unlock size={18} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBlockUser(user)}
                                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                                    title="Bloquear usuário"
                                                                >
                                                                    <Lock size={18} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Excluir usuário"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Plan Settings Tab */}
            {activeTab === 'plans' && <PlanSettingsPanel />}

            {/* Documentation Tab */}
            {activeTab === 'docs' && <DocumentationPanel />}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && <AuditLogPanel />}

            {/* Modal de Exclusão de Usuário */}
            {deleteModalOpen && userToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Excluir Usuário</h3>
                                <p className="text-sm text-slate-500">Ação irreversível!</p>
                            </div>
                        </div>

                        {/* Aviso */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-900">
                                <strong>⚠️ ATENÇÃO:</strong> Você está prestes a excluir permanentemente o usuário:
                            </p>
                            <p className="text-sm font-bold text-red-900 mt-2">
                                {userToDelete.email}
                            </p>
                            <div className="mt-3 pt-3 border-t border-red-200">
                                <p className="text-sm text-red-800">
                                    📊 <strong>URLs criadas:</strong> {userToDelete.url_count || 0}
                                </p>
                                <p className="text-sm text-red-800">
                                    👆 <strong>Cliques totais:</strong> {userToDelete.total_clicks || 0}
                                </p>
                            </div>
                        </div>

                        {/* Opção de URLs */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                O que fazer com as URLs deste usuário?
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="deleteUrls"
                                        checked={!deleteUrls}
                                        onChange={() => setDeleteUrls(false)}
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <div className="font-medium text-slate-900">✅ Manter URLs ativas</div>
                                        <div className="text-xs text-slate-500">Os {userToDelete.url_count || 0} links continuarão funcionando normalmente (recomendado)</div>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="deleteUrls"
                                        checked={deleteUrls}
                                        onChange={() => setDeleteUrls(true)}
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <div className="font-medium text-slate-900">❌ Excluir todas as URLs</div>
                                        <div className="text-xs text-slate-500">Os {userToDelete.url_count || 0} links pararão de funcionar permanentemente</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Confirmação */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Digite <strong>EXCLUIR</strong> para confirmar:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="EXCLUIR"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setUserToDelete(null);
                                    setDeleteConfirmText('');
                                }}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={deleting || deleteConfirmText !== 'EXCLUIR'}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? 'Excluindo...' : 'Excluir Permanentemente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
