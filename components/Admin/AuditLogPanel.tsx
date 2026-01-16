import React, { useState, useEffect } from 'react';
import { Clock, User, Edit, UserCog, FileText } from 'lucide-react';
import { auditLogService, AuditLogEntry } from '../../services/auditLogService';

export const AuditLogPanel: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadLogs();
    }, [filter]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = filter === 'all'
                ? await auditLogService.getRecentLogs(50)
                : await auditLogService.getLogsByAction(filter as any, 50);
            setLogs(data);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAction = (action: string): string => {
        const actions: Record<string, string> = {
            'edit_user_plan': 'Editou plano do usuário',
            'edit_user_limit': 'Definiu limite personalizado',
            'impersonate_user': 'Impersonou usuário',
            'edit_plan_settings': 'Alterou configurações de plano',
            'toggle_feature': 'Marcou feature',
            'add_roadmap_item': 'Adicionou item ao roadmap',
            'remove_roadmap_item': 'Removeu item do roadmap'
        };
        return actions[action] || action;
    };

    const formatDetails = (action: string, details: any): string => {
        if (!details) return '';

        switch (action) {
            case 'edit_user_plan':
                return `${details.user_email}: ${details.old_plan} → ${details.new_plan}`;
            case 'edit_user_limit':
                return `${details.user_email}: ${details.old_limit || 'padrão'} → ${details.new_limit || 'padrão'}`;
            case 'impersonate_user':
                return details.user_email;
            default:
                return JSON.stringify(details);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'edit_user_plan':
            case 'edit_user_limit':
                return <Edit size={16} className="text-blue-600" />;
            case 'impersonate_user':
                return <UserCog size={16} className="text-orange-600" />;
            default:
                return <FileText size={16} className="text-slate-600" />;
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando logs...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="text-indigo-600" />
                    Log de Auditoria
                </h2>
                <p className="text-slate-600 mt-1">Histórico de ações administrativas</p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Filtrar por ação:
                </label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="all">Todas as Ações</option>
                    <option value="edit_user_plan">Edições de Plano</option>
                    <option value="edit_user_limit">Edições de Limite</option>
                    <option value="impersonate_user">Impersonation</option>
                </select>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                {logs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        Nenhum log encontrado
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    {getActionIcon(log.action)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">
                                                {formatAction(log.action)}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">
                                                {formatDetails(log.action, log.details)}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 whitespace-nowrap">
                                            {formatDate(log.created_at)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                        <User size={12} />
                                        <span>{log.admin_email}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <Clock className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-900">
                        <strong>Informação:</strong> Os logs de auditoria registram todas as ações administrativas
                        para fins de segurança e rastreabilidade. Os registros são permanentes e não podem ser editados.
                    </div>
                </div>
            </div>
        </div>
    );
};
