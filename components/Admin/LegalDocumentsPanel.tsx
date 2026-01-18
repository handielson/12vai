import React, { useState, useEffect } from 'react';
import { FileText, Shield, Scale, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { termsService, LegalDocument } from '../../services/termsService';
import { useAuth } from '../../contexts/AuthContext';

export const LegalDocumentsPanel: React.FC = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDoc, setEditingDoc] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        const docs = await termsService.getActiveDocuments();
        setDocuments(docs);
        setLoading(false);
    };

    const startEditing = (doc: LegalDocument) => {
        setEditingDoc(doc.id);
        setEditContent(doc.content);
        setEditTitle(doc.title);
    };

    const cancelEditing = () => {
        setEditingDoc(null);
        setEditContent('');
        setEditTitle('');
    };

    const saveDocument = async (docId: string) => {
        if (!user) return;

        setSaving(true);
        try {
            const success = await termsService.updateDocument(docId, editContent, editTitle);

            if (success) {
                alert('Documento salvo! Para aplicar mudanças aos usuários, publique uma nova versão.');
                await loadDocuments();
                cancelEditing();
            } else {
                alert('Erro ao salvar documento');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar documento');
        } finally {
            setSaving(false);
        }
    };

    const publishNewVersion = async (docId: string) => {
        if (!user) return;

        if (!confirm('Publicar nova versão? Todos os usuários precisarão aceitar novamente.')) {
            return;
        }

        try {
            const newVersion = await termsService.publishNewVersion(docId, user.id);

            if (newVersion) {
                alert(`Nova versão ${newVersion} publicada com sucesso!`);
                await loadDocuments();
            } else {
                alert('Erro ao publicar versão');
            }
        } catch (error) {
            console.error('Erro ao publicar:', error);
            alert('Erro ao publicar versão');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando documentos...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="text-indigo-600" />
                    Documentos Legais (Editável)
                </h2>
                <p className="text-slate-600 mt-1">Edite e publique novas versões dos termos</p>
            </div>

            {/* Info Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-amber-900">
                        <strong>Importante:</strong> Ao publicar uma nova versão, todos os usuários precisarão aceitar os termos novamente no próximo login.
                    </div>
                </div>
            </div>

            {/* Documents */}
            {documents.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {doc.type === 'terms' ? (
                                    <FileText className="text-indigo-600" size={24} />
                                ) : (
                                    <Shield className="text-green-600" size={24} />
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-900">{doc.title}</h3>
                                    <p className="text-sm text-slate-600">
                                        Versão {doc.version} - Tipo: {doc.type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {editingDoc === doc.id ? (
                                    <>
                                        <button
                                            onClick={() => saveDocument(doc.id)}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {saving ? 'Salvando...' : 'Salvar'}
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                        >
                                            <X size={16} />
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEditing(doc)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            <Edit2 size={16} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => publishNewVersion(doc.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                        >
                                            Publicar Nova Versão
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {editingDoc === doc.id ? (
                            <div className="space-y-4">
                                {/* Title Editor */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Content Editor */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Conteúdo (Markdown)
                                    </label>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={20}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                                        placeholder="Digite o conteúdo em Markdown..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap text-slate-700">
                                    {doc.content}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Clique em "Editar" para modificar o documento</li>
                    <li>Edite o conteúdo em Markdown</li>
                    <li>Clique em "Salvar" para guardar as mudanças</li>
                    <li>Clique em "Publicar Nova Versão" para aplicar aos usuários</li>
                    <li>Usuários verão o modal de aceite no próximo login</li>
                </ol>
            </div>
        </div>
    );
};
