import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, AlertCircle, BarChart3, Clock } from 'lucide-react';
import { apiKeyService, ApiKey, ApiStats } from '../../services/apiKeyService';
import { useAuth } from '../../contexts/AuthContext';

export const ApiKeysPanel: React.FC = () => {
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [stats, setStats] = useState<ApiStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyEnvironment, setNewKeyEnvironment] = useState<'live' | 'test'>('live');
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        const [keys, statistics] = await Promise.all([
            apiKeyService.getUserApiKeys(user.id),
            apiKeyService.getApiStats(user.id)
        ]);

        setApiKeys(keys);
        setStats(statistics);
        setLoading(false);
    };

    const handleCreateKey = async () => {
        if (!user || !newKeyName.trim()) return;

        const result = await apiKeyService.createApiKey(
            user.id,
            newKeyName.trim(),
            newKeyEnvironment
        );

        if (result) {
            setCreatedKey(result.plainKey);
            setNewKeyName('');
            await loadData();
        } else {
            alert('Erro ao criar API key');
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!user) return;
        if (!confirm('Revogar esta API key? Ela não poderá mais ser usada.')) return;

        const success = await apiKeyService.revokeApiKey(keyId, user.id);
        if (success) {
            await loadData();
        } else {
            alert('Erro ao revogar API key');
        }
    };

    const copyToClipboard = (text: string, keyId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreatedKey(null);
        setNewKeyName('');
        setNewKeyEnvironment('live');
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Key className="text-indigo-600" />
                        API Keys
                    </h2>
                    <p className="text-slate-600 mt-1">Gerencie suas chaves de API para integração</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                    <Plus size={20} />
                    Criar Nova Chave
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-sm text-slate-600">Total de Requisições</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                            {stats.total_requests?.toLocaleString() || 0}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-sm text-slate-600">Hoje</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                            {stats.requests_today?.toLocaleString() || 0}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-sm text-slate-600">Taxa de Sucesso</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                            {stats.success_rate?.toFixed(1) || 0}%
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-sm text-slate-600">Tempo Médio</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                            {stats.avg_response_time_ms?.toFixed(0) || 0}ms
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900">Suas API Keys</h3>
                </div>

                {apiKeys.length === 0 ? (
                    <div className="p-12 text-center">
                        <Key className="mx-auto text-slate-300" size={48} />
                        <p className="text-slate-500 mt-4">Nenhuma API key criada ainda</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Criar Primeira Chave
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {apiKeys.map(key => (
                            <div key={key.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-semibold text-slate-900">{key.name}</h4>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${key.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {key.active ? 'Ativa' : 'Revogada'}
                                            </span>
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
                                                {key.prefix}***
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-600 flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                Criada: {new Date(key.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                            {key.last_used_at && (
                                                <span className="flex items-center gap-1">
                                                    <BarChart3 size={14} />
                                                    Último uso: {new Date(key.last_used_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {key.active && (
                                        <button
                                            onClick={() => handleRevokeKey(key.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                        >
                                            <Trash2 size={16} />
                                            Revogar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-amber-900">
                        <strong>Importante:</strong> Mantenha suas API keys em segurança. Nunca compartilhe ou exponha em código público.
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        {createdKey ? (
                            <>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">
                                    API Key Criada com Sucesso!
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-green-900 mb-2">
                                        <strong>Atenção:</strong> Esta é a única vez que você verá esta chave. Copie e guarde em local seguro.
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-sm font-mono break-all">
                                            {createdKey}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(createdKey, 'new')}
                                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            {copiedKey === 'new' ? <Check size={20} /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={closeCreateModal}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Entendi, Fechar
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Criar Nova API Key</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Nome da Chave
                                        </label>
                                        <input
                                            type="text"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            placeholder="Ex: Meu App, Produção, Desenvolvimento..."
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Ambiente
                                        </label>
                                        <select
                                            value={newKeyEnvironment}
                                            onChange={(e) => setNewKeyEnvironment(e.target.value as 'live' | 'test')}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="live">Produção (live)</option>
                                            <option value="test">Teste (test)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleCreateKey}
                                        disabled={!newKeyName.trim()}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Criar Chave
                                    </button>
                                    <button
                                        onClick={closeCreateModal}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
