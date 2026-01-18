import React, { useState, useEffect } from 'react';
import { X, FileText, Shield, ExternalLink } from 'lucide-react';
import { termsService, LegalDocument } from '../services/termsService';

interface TermsAcceptanceModalProps {
    userId: string;
    onAccepted: () => void;
}

export const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({ userId, onAccepted }) => {
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [acceptances, setAcceptances] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        const docs = await termsService.getActiveDocuments();
        setDocuments(docs);

        // Inicializar aceites como false
        const initialAcceptances: Record<string, boolean> = {};
        docs.forEach(doc => {
            initialAcceptances[doc.id] = false;
        });
        setAcceptances(initialAcceptances);
        setLoading(false);
    };

    const handleAcceptanceChange = (documentId: string, checked: boolean) => {
        setAcceptances(prev => ({
            ...prev,
            [documentId]: checked
        }));
    };

    const allAccepted = documents.length > 0 &&
        documents.every(doc => acceptances[doc.id] === true);

    const handleSubmit = async () => {
        if (!allAccepted) return;

        setSubmitting(true);
        try {
            const documentIds = documents.map(doc => doc.id);
            const success = await termsService.recordMultipleAcceptances(userId, documentIds);

            if (success) {
                onAccepted();
            } else {
                alert('Erro ao registrar aceite. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao aceitar termos:', error);
            alert('Erro ao registrar aceite. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8">
                    <div className="text-center">Carregando...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-indigo-600" />
                        Termos de Uso e Privacidade
                    </h2>
                    <p className="text-slate-600 mt-2">
                        Para continuar, você precisa aceitar nossos termos e políticas.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    {doc.type === 'terms' ? (
                                        <FileText className="text-indigo-600" size={20} />
                                    ) : (
                                        <Shield className="text-green-600" size={20} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Versão {doc.version} - Última atualização: {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                                    </p>

                                    {/* Preview do conteúdo */}
                                    <div className="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-700 max-h-32 overflow-y-auto">
                                        {doc.content.substring(0, 300)}...
                                    </div>

                                    {/* Link para ver completo */}
                                    <a
                                        href={`/docs/${doc.type}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                                    >
                                        Ler documento completo
                                        <ExternalLink size={14} />
                                    </a>

                                    {/* Checkbox de aceite */}
                                    <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={acceptances[doc.id] || false}
                                            onChange={(e) => handleAcceptanceChange(doc.id, e.target.checked)}
                                            className="w-5 h-5 text-indigo-600 rounded mt-0.5 cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                            Li e aceito {doc.type === 'terms' ? 'os Termos de Uso' : 'a Política de Privacidade'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Você deve aceitar todos os documentos para continuar
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={!allAccepted || submitting}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${allAccepted && !submitting
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? 'Registrando...' : 'Aceitar e Continuar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAcceptanceModal;
