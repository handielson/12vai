import React, { useState, useEffect } from 'react';
import { Wrench, Power, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const MaintenanceControl: React.FC = () => {
    const { user } = useAuth();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [message, setMessage] = useState('Estamos em manutenção. Voltaremos em breve!');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadMaintenanceStatus();
        loadHistory();
    }, []);

    const loadMaintenanceStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value, updated_at, updated_by')
                .eq('key', 'maintenance_mode')
                .single();

            if (data && !error) {
                setMaintenanceMode(data.value.enabled);
                setMessage(data.value.message || 'Estamos em manutenção. Voltaremos em breve!');
            }
        } catch (error) {
            console.error('Erro ao carregar status:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            // Buscar logs de auditoria relacionados a manutenção
            const { data, error } = await supabase
                .from('audit_log')
                .select('*')
                .eq('action', 'toggle_maintenance')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Erro ao carregar histórico:', error);
                return;
            }

            // Se temos dados, buscar emails dos admins separadamente
            if (data && data.length > 0) {
                const adminIds = [...new Set(data.map(log => log.admin_id).filter(Boolean))];

                if (adminIds.length > 0) {
                    const { data: usersData } = await supabase
                        .from('users')
                        .select('id, email')
                        .in('id', adminIds);

                    // Mapear emails para os logs
                    const logsWithEmails = data.map(log => ({
                        ...log,
                        admin_email: usersData?.find(u => u.id === log.admin_id)?.email || 'Admin'
                    }));

                    setHistory(logsWithEmails);
                } else {
                    setHistory(data.map(log => ({ ...log, admin_email: 'Admin' })));
                }
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            setHistory([]);
        }
    };

    const toggleMaintenance = async () => {
        console.log('🔧 toggleMaintenance chamado');
        const newStatus = !maintenanceMode;
        console.log('📊 Status atual:', maintenanceMode, '→ Novo status:', newStatus);

        const confirmMessage = newStatus
            ? '⚠️ ATIVAR MODO DE MANUTENÇÃO?\n\n• O site ficará INACESSÍVEL para todos os usuários\n• Apenas admins conseguirão acessar\n• Visitantes verão a página de manutenção\n\nDeseja continuar?'
            : '✅ DESATIVAR MODO DE MANUTENÇÃO?\n\n• O site voltará a ficar ACESSÍVEL\n• Todos os usuários poderão usar normalmente\n\nDeseja continuar?';

        console.log('❓ Mostrando confirmação...');
        if (!confirm(confirmMessage)) {
            console.log('❌ Usuário cancelou');
            return;
        }

        console.log('✅ Usuário confirmou, iniciando alteração...');
        setToggling(true);
        try {
            console.log('1️⃣ Atualizando app_settings...');
            // 1. Atualizar configuração
            const { error: updateError } = await supabase
                .from('app_settings')
                .update({
                    value: {
                        enabled: newStatus,
                        message: message
                    },
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                })
                .eq('key', 'maintenance_mode');

            if (updateError) {
                console.error('❌ Erro ao atualizar app_settings:', updateError);
                throw updateError;
            }
            console.log('✅ app_settings atualizado com sucesso');

            console.log('2️⃣ Inserindo no audit_log...');
            // 2. Registrar no log de auditoria
            const { error: logError } = await supabase
                .from('audit_log')
                .insert({
                    admin_id: user?.id,
                    action: 'toggle_maintenance',
                    entity_type: 'system',
                    entity_id: 'maintenance_mode',
                    details: {
                        previous_status: maintenanceMode,
                        new_status: newStatus,
                        message: message
                    }
                });

            if (logError) {
                console.error('⚠️ Erro ao registrar log (não crítico):', logError);
            } else {
                console.log('✅ Log de auditoria registrado');
            }

            console.log('3️⃣ Atualizando estado local...');
            // 3. Atualizar estado
            setMaintenanceMode(newStatus);
            console.log('✅ Estado atualizado');

            console.log('4️⃣ Recarregando histórico...');
            // 4. Recarregar histórico
            await loadHistory();
            console.log('✅ Histórico recarregado');

            console.log('5️⃣ Mostrando confirmação...');
            // 5. Mostrar confirmação
            alert(newStatus
                ? '🔴 MODO DE MANUTENÇÃO ATIVADO!\n\n✅ O site agora mostra a página de manutenção para visitantes.\n✅ Admins continuam com acesso total.\n✅ Alteração registrada no log de auditoria.'
                : '🟢 MODO DE MANUTENÇÃO DESATIVADO!\n\n✅ O site voltou ao normal.\n✅ Todos os usuários podem acessar.\n✅ Alteração registrada no log de auditoria.');
            console.log('✅ Processo concluído com sucesso!');

        } catch (error: any) {
            console.error('💥 ERRO FATAL:', error);
            alert('❌ Erro ao alterar modo de manutenção:\n\n' + error.message);
        } finally {
            console.log('🏁 Finalizando (setToggling false)...');
            setToggling(false);
        }
    };

    const updateMessage = async () => {
        if (!message.trim()) {
            alert('A mensagem não pode estar vazia!');
            return;
        }

        try {
            const { error } = await supabase
                .from('app_settings')
                .update({
                    value: {
                        enabled: maintenanceMode,
                        message: message
                    },
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                })
                .eq('key', 'maintenance_mode');

            if (error) throw error;

            alert('✅ Mensagem atualizada com sucesso!');
        } catch (error: any) {
            alert('❌ Erro ao atualizar mensagem:\n\n' + error.message);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
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
                <div className="text-slate-500">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Wrench className="text-amber-600" />
                    Modo de Manutenção
                </h2>
                <p className="text-slate-600 mt-1">
                    Controle o acesso ao site para realizar manutenções
                </p>
            </div>

            {/* Status Card */}
            <div className={`rounded-2xl border-2 p-8 ${maintenanceMode
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
                }`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {maintenanceMode ? (
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-white" size={32} />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="text-white" size={32} />
                            </div>
                        )}
                        <div>
                            <div className="text-2xl font-bold text-slate-900">
                                {maintenanceMode ? 'MODO DE MANUTENÇÃO ATIVO' : 'SITE OPERACIONAL'}
                            </div>
                            <div className="text-slate-600 mt-1">
                                {maintenanceMode
                                    ? 'O site está inacessível para usuários comuns'
                                    : 'O site está funcionando normalmente'}
                            </div>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={toggleMaintenance}
                        disabled={toggling}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${maintenanceMode
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                            }`}
                    >
                        <Power size={24} className={toggling ? 'animate-spin' : ''} />
                        {toggling ? 'Alterando...' : maintenanceMode ? 'Desativar Manutenção' : 'Ativar Manutenção'}
                    </button>
                </div>

                {/* Info Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-xs font-medium text-slate-500 mb-1">Status Atual</div>
                        <div className="text-lg font-bold text-slate-900">
                            {maintenanceMode ? '🔴 Em Manutenção' : '🟢 Operacional'}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-xs font-medium text-slate-500 mb-1">Acesso de Admins</div>
                        <div className="text-lg font-bold text-slate-900">
                            ✅ Sempre Permitido
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-xs font-medium text-slate-500 mb-1">Acesso de Usuários</div>
                        <div className="text-lg font-bold text-slate-900">
                            {maintenanceMode ? '❌ Bloqueado' : '✅ Permitido'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Editor */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Mensagem de Manutenção
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    Esta mensagem será exibida para os visitantes quando o modo de manutenção estiver ativo.
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite a mensagem..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <button
                        onClick={updateMessage}
                        className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                        Atualizar Mensagem
                    </button>
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={20} />
                    Histórico de Alterações
                </h3>

                {history.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Nenhuma alteração registrada
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.details?.new_status ? 'bg-red-100' : 'bg-green-100'
                                    }`}>
                                    {log.details?.new_status ? (
                                        <AlertTriangle className="text-red-600" size={20} />
                                    ) : (
                                        <CheckCircle className="text-green-600" size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-900">
                                        {log.details?.new_status ? 'Manutenção Ativada' : 'Manutenção Desativada'}
                                    </div>
                                    <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                        <User size={12} />
                                        {log.admin_email || 'Admin'}
                                        <span className="text-slate-400">•</span>
                                        {formatDate(log.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-amber-900">
                        <strong>Atenção:</strong> Ao ativar o modo de manutenção, todos os usuários comuns serão impedidos de acessar o site.
                        Apenas administradores conseguirão fazer login e usar o sistema. Use esta funcionalidade apenas quando necessário.
                    </div>
                </div>
            </div>
        </div>
    );
};
