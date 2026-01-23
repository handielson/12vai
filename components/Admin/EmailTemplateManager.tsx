import React, { useState } from 'react';
import { EmailTemplates } from './EmailTemplates';
import { Save, X, Eye, Code } from 'lucide-react';
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

export const EmailTemplateManager: React.FC = () => {
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setSubject(template.subject);
        setHtmlContent(template.html_content);
        setPreviewMode(false);
    };

    const handleSave = async () => {
        if (!editingTemplate) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('email_templates')
                .update({
                    subject,
                    html_content: htmlContent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTemplate.id);

            if (error) throw error;

            alert('✅ Template atualizado com sucesso!');
            setEditingTemplate(null);
            setSubject('');
            setHtmlContent('');
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            alert('❌ Erro ao salvar template. Verifique o console.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (confirm('Descartar alterações?')) {
            setEditingTemplate(null);
            setSubject('');
            setHtmlContent('');
        }
    };

    // Substituir variáveis para preview
    const getPreviewHtml = () => {
        const sampleVariables: Record<string, string> = {
            user_name: 'João Silva',
            user_email: 'joao@exemplo.com',
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

        let preview = htmlContent;
        Object.entries(sampleVariables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            preview = preview.replace(regex, value);
        });

        return preview;
    };

    if (editingTemplate) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">✏️ Editar Template</h2>
                        <p className="text-slate-600 mt-1">{editingTemplate.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${previewMode
                                    ? 'bg-slate-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {previewMode ? <Code size={20} /> : <Eye size={20} />}
                            {previewMode ? 'Código' : 'Preview'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
                        >
                            <X size={20} />
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                        >
                            <Save size={20} />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>

                {/* Description */}
                {editingTemplate.description && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">{editingTemplate.description}</p>
                    </div>
                )}

                {/* Variables */}
                {editingTemplate.variables && editingTemplate.variables.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 mb-2">📝 Variáveis Disponíveis:</h4>
                        <div className="flex flex-wrap gap-2">
                            {editingTemplate.variables.map((variable) => (
                                <code
                                    key={variable}
                                    className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm font-mono cursor-pointer hover:bg-amber-200"
                                    onClick={() => {
                                        const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
                                        if (textarea) {
                                            const cursorPos = textarea.selectionStart;
                                            const textBefore = htmlContent.substring(0, cursorPos);
                                            const textAfter = htmlContent.substring(cursorPos);
                                            setHtmlContent(`${textBefore}{${variable}}${textAfter}`);
                                        }
                                    }}
                                    title="Clique para inserir no cursor"
                                >
                                    {`{${variable}}`}
                                </code>
                            ))}
                        </div>
                        <p className="text-xs text-amber-700 mt-2">💡 Clique em uma variável para inserir no cursor</p>
                    </div>
                )}

                {/* Subject */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Assunto do Email
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Assunto do email..."
                    />
                </div>

                {/* HTML Editor / Preview */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                        <h3 className="font-semibold text-slate-900">
                            {previewMode ? '👁️ Preview do Email' : '💻 Código HTML'}
                        </h3>
                    </div>

                    {previewMode ? (
                        <div className="p-6">
                            <div className="bg-slate-100 rounded-lg p-4 mb-4">
                                <p className="text-sm text-slate-700">
                                    <strong>Assunto:</strong> {subject}
                                </p>
                            </div>
                            <div
                                className="border border-slate-300 rounded-lg bg-white"
                                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                            />
                        </div>
                    ) : (
                        <textarea
                            id="html-editor"
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className="w-full h-[600px] p-6 font-mono text-sm focus:outline-none resize-none"
                            placeholder="Cole aqui o código HTML do template..."
                            spellCheck={false}
                        />
                    )}
                </div>

                {/* Tips */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">💡 Dicas:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Use as variáveis disponíveis para personalizar o email</li>
                        <li>• Teste o template após salvar usando o botão "Enviar email de teste"</li>
                        <li>• Use HTML inline CSS para melhor compatibilidade com clientes de email</li>
                        <li>• Evite JavaScript e CSS externo</li>
                    </ul>
                </div>
            </div>
        );
    }

    return <EmailTemplates onEdit={handleEdit} />;
};

export default EmailTemplateManager;
