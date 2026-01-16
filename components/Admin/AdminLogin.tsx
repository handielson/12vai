import React, { useState } from 'react';
import { Shield, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Fazer login
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Falha na autenticação');

            // 2. Verificar se é admin
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', authData.user.id)
                .single();

            if (userError) throw userError;

            if (!userData?.is_admin) {
                // Fazer logout se não for admin
                await supabase.auth.signOut();
                throw new Error('Acesso negado. Apenas administradores podem acessar este portal.');
            }

            // 3. Login bem-sucedido
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl shadow-2xl mb-4">
                        <Shield size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Portal Administrativo</h1>
                    <p className="text-slate-400">VaiEncurta - Acesso Restrito</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <div className="text-sm text-red-800">{error}</div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Administrativo
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@vaiencurta.com"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg font-bold hover:from-rose-700 hover:to-rose-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Acessar Portal Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="text-xs text-slate-500 text-center space-y-1">
                            <p>🔒 Acesso restrito a administradores</p>
                            <p>Este portal é independente do sistema principal</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        VaiEncurta © 2024 - Sistema de Gestão
                    </p>
                </div>
            </div>
        </div>
    );
};
