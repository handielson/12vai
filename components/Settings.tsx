import React, { useState } from 'react';
import { User, Lock, AlertTriangle, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
    const { user, supabaseUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState(user?.email?.split('@')[0] || '');

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'security', label: 'Segurança', icon: Lock }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
                <p className="text-slate-500">Gerencie suas preferências e configurações de conta</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Informações do Perfil</h3>
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={supabaseUser?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">Seu email não pode ser alterado</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nome de Exibição
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Como você quer ser chamado?"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Plano Atual
                            </label>
                            <div className="px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <span className="text-indigo-900 font-bold capitalize">{user?.plan || 'Free'}</span>
                            </div>
                        </div>

                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                            <Save size={18} />
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Alterar Senha</h3>
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Senha Atual
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>

                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all">
                                Atualizar Senha
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl border-2 border-rose-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="text-rose-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Zona de Perigo</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Deletar sua conta é uma ação permanente e não pode ser desfeita. Todos os seus links e dados serão perdidos.
                                </p>
                                <button className="px-6 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all">
                                    Deletar Conta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
