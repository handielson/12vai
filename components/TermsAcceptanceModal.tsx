import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Shield, ExternalLink, ArrowDown, CheckCircle } from 'lucide-react';
import { termsService, LegalDocument } from '../services/termsService';

interface TermsAcceptanceModalProps {
    userId: string;
    onAccepted: () => void;
}

export const TermsAcceptanceModal: React.FC<TermsAcceptanceModalProps> = ({ userId, onAccepted }) => {
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [acceptances, setAcceptances] = useState<Record<string, boolean>>({});
    const [scrolledToBottom, setScrolledToBottom] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        const docs = await termsService.getActiveDocuments();
        setDocuments(docs);

        // Inicializar aceites e scroll como false
        const initialAcceptances: Record<string, boolean> = {};
        const initialScrolled: Record<string, boolean> = {};
        docs.forEach(doc => {
            initialAcceptances[doc.id] = false;
            initialScrolled[doc.id] = false;
        });
        setAcceptances(initialAcceptances);
        setScrolledToBottom(initialScrolled);
        setLoading(false);
    };

    const handleScroll = (documentId: string, e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isAtBottom = Math.abs(
            element.scrollHeight - element.scrollTop - element.clientHeight
        ) < 10; // 10px de tolerância

        if (isAtBottom && !scrolledToBottom[documentId]) {
            setScrolledToBottom(prev => ({
                ...prev,
                [documentId]: true
            }));
        }
    };

    const handleAcceptanceChange = (documentId: string, checked: boolean) => {
        // Só permite aceitar se já rolou até o final
        if (!scrolledToBottom[documentId] && checked) {
            return;
        }

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
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-indigo-600" />
                        Termos de Uso e Privacidade
                    </h2>
                    <p className="text-slate-600 mt-2">
                        Por favor, leia atentamente e role até o final de cada documento para aceitar.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {documents.map(doc => (
                        <div key={doc.id} className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* Document Header */}
                            <div className="bg-slate-50 p-4 border-b border-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {doc.type === 'terms' ? (
                                            <FileText className="text-indigo-600" size={24} />
                                        ) : (
                                            <Shield className="text-green-600" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900">{doc.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Versão {doc.version} - Última atualização: {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div
                                ref={el => scrollRefs.current[doc.id] = el}
                                onScroll={(e) => handleScroll(doc.id, e)}
                                className="relative h-64 overflow-y-auto p-6 bg-white"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                    {doc.content}
                                </div>

                                {/* Scroll Indicator - só mostra se não rolou até o final */}
                                {!scrolledToBottom[doc.id] && (
                                    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium animate-bounce">
                                            <ArrowDown size={16} />
                                            Role até o final para aceitar
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Acceptance Checkbox */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <label className={`flex items - start gap - 3 cursor - pointer group ${!scrolledToBottom[doc.id] ? 'opacity-50 cursor-not-allowed' : ''
                                    } `}>
                                    <input
                                        type="checkbox"
                                        checked={acceptances[doc.id] || false}
                                        onChange={(e) => handleAcceptanceChange(doc.id, e.target.checked)}
                                        disabled={!scrolledToBottom[doc.id]}
                                        className="w-5 h-5 text-indigo-600 rounded mt-0.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600">
                                            {scrolledToBottom[doc.id] ? (
                                                <>
                                                    <CheckCircle className="inline w-4 h-4 text-green-600 mr-1" />
                                                    Li e aceito {doc.type === 'terms' ? 'os Termos de Uso' : 'a Política de Privacidade'}
                                                </>
                                            ) : (
                                                <>Role até o final do documento para aceitar</>
                                            )}
                                        </span>
                                        {scrolledToBottom[doc.id] && !acceptances[doc.id] && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Marque a caixa acima para confirmar que leu e aceita este documento
                                            </p>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                {allAccepted ? (
                                    <span className="text-green-600 flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        Todos os documentos foram aceitos
                                    </span>
                                ) : (
                                    <span className="text-slate-600">
                                        Você deve ler e aceitar todos os documentos para continuar
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {documents.filter(doc => acceptances[doc.id]).length} de {documents.length} documentos aceitos
                            </p>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!allAccepted || submitting}
                            className={`px - 8 py - 3 rounded - lg font - semibold transition - all ${allAccepted && !submitting
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                } `}
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
