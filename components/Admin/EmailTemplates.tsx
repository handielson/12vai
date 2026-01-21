import React, { useState, useEffect } from 'react';
import { Mail, Edit, Eye, Clock, CheckCircle, XCircle, Plus, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailTemplate {
    id: string;
    type: string;
    name: string;
    description: string;
    subject: string;
    html_content: string;
    active: boolean;
    updated_at: string;
    variables: string[];
}

interface EmailTemplatesProps {
    onEdit: (template: EmailTemplate) => void;
}

export const EmailTemplates: React.FC<EmailTemplatesProps> = ({ onEdit }) => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [testModal, setTestModal] = useState<{ show: boolean; template: EmailTemplate | null }>({
        show: false,
        template: null
    });
    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .order('name');

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('email_templates')
                .update({ active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            loadTemplates();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const sendTestEmail = async () => {
        if (!testEmail || !testModal.template) return;

        setSending(true);
        try {
            // Preparar variáveis de exemplo
            const sampleVariables: Record<string, string> = {
                user_name: 'João Silva',
                user_email: testEmail,
                dashboard_link: `${window.location.origin}/dashboard`,
                settings_link: `${window.location.origin}/settings`,
                support_email: 'suporte@12vai.com',
                current_year: new Date().getFullYear().toString(),
                plan_name: 'Pro',
                amount: '29,90',
                next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
                invoice_link: `${window.location.origin}/billing`,
                update_payment_link: `${window.location.origin}/billing`
            };

            // Substituir variáveis
            let subject = testModal.template.subject;
            let html = testModal.template.html_content;

            Object.entries(sampleVariables).forEach(([key, value]) => {
                const regex = new RegExp(`\\{${key}\\}`, 'g');
                subject = subject.replace(regex, value);
                html = html.replace(regex, value);
            });

            // Enviar via API (funciona tanto local quanto produção)
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: testEmail,
                    subject: `[TESTE] ${subject}`,
                    html,
                    type: testModal.template.type
                })
            });

            if (!response.ok) throw new Error('Falha ao enviar email');

            alert(`✅ Email de teste enviado para ${testEmail}!\n\nVerifique sua caixa de entrada (pode estar no spam).`);
            setTestModal({ show: false, template: null });
            setTestEmail('');
        } catch (error) {
            console.error('Erro ao enviar email de teste:', error);
            alert('❌ Erro ao enviar email de teste. Verifique o console.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando templates...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">📧 Email Templates</h2>
                    <p className="text-slate-600 mt-1">Gerencie os templates de email transacionais</p>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid gap-4">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.active ? 'bg-indigo-100' : 'bg-slate-100'
                                    }`}>
                                    <Mail className={template.active ? 'text-indigo-600' : 'text-slate-400'} size={24} />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                                        {template.active ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                                Inativo
                                            </span>
                                        )}
                                    </div>

                                    {template.description && (
                                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                                    )}

                                    <div className="mt-3 space-y-1">
                                        <p className="text-sm text-slate-700">
                                            <strong>Assunto:</strong> {template.subject}
                                        </p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            Atualizado: {new Date(template.updated_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>

                                    {/* Variables */}
                                    {template.variables && template.variables.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {template.variables.map((variable) => (
                                                <span
                                                    key={variable}
                                                    className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-mono rounded"
                                                >
                                                    {`{${variable}}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setTestModal({ show: true, template })}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Enviar email de teste"
                                >
                                    <Send size={20} />
                                </button>

                                <button
                                    onClick={() => onEdit(template)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Editar template"
                                >
                                    <Edit size={20} />
                                </button>

                                <button
                                    onClick={() => toggleActive(template.id, template.active)}
                                    className={`p-2 rounded-lg transition-colors ${template.active
                                        ? 'text-slate-600 hover:bg-slate-100'
                                        : 'text-green-600 hover:bg-green-50'
                                        }`}
                                    title={template.active ? 'Desativar' : 'Ativar'}
                                >
                                    {template.active ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <Mail className="mx-auto text-slate-300" size={48} />
                    <p className="text-slate-600 mt-4">Nenhum template encontrado</p>
                </div>
            )}

            {/* Test Email Modal */}
            {testModal.show && testModal.template && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            📧 Enviar Email de Teste
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-slate-600 mb-2">
                                Template: <strong>{testModal.template.name}</strong>
                            </p>
                            <p className="text-xs text-slate-500">
                                As variáveis serão preenchidas com dados de exemplo
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email de Destino
                            </label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setTestModal({ show: false, template: null });
                                    setTestEmail('');
                                }}
                                className="flex-1 px-4 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={sendTestEmail}
                                disabled={!testEmail || sending}
                                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailTemplates;
