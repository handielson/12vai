import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Code, Type, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface EmailTemplate {
    id: string;
    type: string;
    name: string;
    description: string;
    subject: string;
    html_content: string;
    text_content: string | null;
    active: boolean;
    variables: string[];
}

interface EmailTemplateEditorProps {
    template: EmailTemplate;
    onClose: () => void;
    onSaved: () => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
    template,
    onClose,
    onSaved
}) => {
    const { user } = useAuth();
    const [subject, setSubject] = useState(template.subject);
    const [htmlContent, setHtmlContent] = useState(template.html_content);
    const [textContent, setTextContent] = useState(template.text_content || '');
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const { error: updateError } = await supabase
                .from('email_templates')
                .update({
                    subject,
                    html_content: htmlContent,
                    text_content: textContent || null,
                    updated_by: user?.id
                })
                .eq('id', template.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                onSaved();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar template');
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = (variable: string) => {
        const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = htmlContent;
            const before = text.substring(0, start);
            const after = text.substring(end);
            setHtmlContent(before + `{${variable}}` + after);

            // Restore cursor position
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
            }, 0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">✏️ Editar Template</h2>
                        <p className="text-slate-600 mt-1">{template.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Alerts */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                            <CheckCircle size={20} />
                            Template salvo com sucesso!
                        </div>
                    )}

                    {/* Subject */}
                    <div>
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

                    {/* Variables */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Variáveis Disponíveis
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {template.variables.map((variable) => (
                                <button
                                    key={variable}
                                    onClick={() => insertVariable(variable)}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-mono rounded-lg transition-colors"
                                >
                                    {`{${variable}}`}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Clique em uma variável para inseri-la no cursor
                        </p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 border-b border-slate-200">
                        <button
                            onClick={() => setViewMode('code')}
                            className={`px-4 py-2 font-medium transition-colors ${viewMode === 'code'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Code size={16} className="inline mr-2" />
                            Código HTML
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-4 py-2 font-medium transition-colors ${viewMode === 'preview'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Eye size={16} className="inline mr-2" />
                            Preview
                        </button>
                    </div>

                    {/* HTML Editor */}
                    {viewMode === 'code' ? (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Conteúdo HTML
                            </label>
                            <textarea
                                id="html-editor"
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                                className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                                placeholder="HTML do email..."
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Preview do Email
                            </label>
                            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 h-96 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                ⚠️ Variáveis aparecerão como {`{variable_name}`} no preview
                            </p>
                        </div>
                    )}

                    {/* Text Content (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Conteúdo Texto Plano (Opcional)
                        </label>
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                            placeholder="Versão em texto plano (fallback)..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Usado quando o cliente de email não suporta HTML
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || success}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save size={20} />
                        {saving ? 'Salvando...' : success ? 'Salvo!' : 'Salvar Template'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplateEditor;
