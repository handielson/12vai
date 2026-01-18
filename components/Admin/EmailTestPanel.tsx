import React, { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../contexts/AuthContext';

export const EmailTestPanel: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [testEmail, setTestEmail] = useState('');

    const handleTestWelcome = async () => {
        if (!testEmail || !user) return;

        setLoading(true);
        setResult(null);

        try {
            const success = await emailService.sendWelcomeEmail(
                testEmail,
                'Teste Admin',
                user.id
            );

            if (success) {
                setResult({
                    type: 'success',
                    message: `✅ Email de boas-vindas enviado para ${testEmail}! Verifique sua caixa de entrada (pode estar no spam).`
                });
            } else {
                setResult({
                    type: 'error',
                    message: '❌ Falha ao enviar email. Verifique os logs do console.'
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTestLimitAlert = async () => {
        if (!testEmail || !user) return;

        setLoading(true);
        setResult(null);

        try {
            const success = await emailService.sendLimitAlert(
                testEmail,
                'Teste Admin',
                user.id,
                { current: 800, limit: 1000, percentage: 80 }
            );

            if (success) {
                setResult({
                    type: 'success',
                    message: `✅ Alerta de limite enviado para ${testEmail}!`
                });
            } else {
                setResult({
                    type: 'error',
                    message: '❌ Falha ao enviar email.'
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            });
        } finally {
            setLoading(false);
        }
    };

    const checkConfig = () => {
        const apiKey = import.meta.env.VITE_RESEND_API_KEY;
        const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL;

        if (!apiKey) {
            setResult({
                type: 'error',
                message: '❌ VITE_RESEND_API_KEY não configurada!'
            });
            return;
        }

        setResult({
            type: 'success',
            message: `✅ Configuração OK!\nAPI Key: ${apiKey.substring(0, 15)}...\nFrom: ${fromEmail}`
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="text-indigo-600" />
                    Teste de Emails
                </h2>
                <p className="text-slate-600 mt-1">Envie emails de teste para verificar o sistema</p>
            </div>

            {/* Config Check */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">1. Verificar Configuração</h3>
                <button
                    onClick={checkConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                    <CheckCircle size={20} />
                    Verificar Env Vars
                </button>
            </div>

            {/* Test Email Input */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">2. Email de Destino</h3>
                <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-sm text-slate-500 mt-2">
                    Digite o email onde deseja receber os testes
                </p>
            </div>

            {/* Test Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">3. Enviar Emails de Teste</h3>

                <div className="space-y-3">
                    {/* Welcome Email */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-slate-900">Email de Boas-vindas</h4>
                            <p className="text-sm text-slate-600">Template de boas-vindas para novos usuários</p>
                        </div>
                        <button
                            onClick={handleTestWelcome}
                            disabled={!testEmail || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                            Enviar
                        </button>
                    </div>

                    {/* Limit Alert */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-slate-900">Alerta de Limite</h4>
                            <p className="text-sm text-slate-600">Email quando usuário atinge 80% do plano</p>
                        </div>
                        <button
                            onClick={handleTestLimitAlert}
                            disabled={!testEmail || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                            Enviar
                        </button>
                    </div>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`rounded-lg p-4 ${result.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                    <div className="flex gap-3">
                        {result.type === 'success' ? (
                            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                        ) : (
                            <XCircle className="text-red-600 flex-shrink-0" size={24} />
                        )}
                        <div className={`text-sm whitespace-pre-line ${result.type === 'success' ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {result.message}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-900">
                        <strong>Importante:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Emails podem ir para a pasta de spam</li>
                            <li>Verifique o dashboard do Resend para confirmar envio</li>
                            <li>Configure o domínio no Resend para melhor deliverability</li>
                            <li>Migration 007 deve estar executada no Supabase</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Links Úteis */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Links Úteis</h3>
                <div className="space-y-2">
                    <a
                        href="https://resend.com/emails"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                        📧 Dashboard Resend (ver emails enviados)
                    </a>
                    <a
                        href="https://resend.com/domains"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                    >
                        🌐 Configurar Domínio
                    </a>
                </div>
            </div>
        </div>
    );
};
