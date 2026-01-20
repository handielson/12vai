import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Home, Plus, Mail, User, MessageSquare, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService, CreateTicketData } from '../services/ticketService';

export default function ContactPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreateTicketData>({
        name: '',
        email: '',
        category: 'suporte_tecnico',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [ticketNumber, setTicketNumber] = useState('');
    const [error, setError] = useState('');

    // Auto-preencher nome e email se usuário estiver autenticado
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.user_metadata?.name || user.email?.split('@')[0] || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const categories = [
        { value: 'suporte_tecnico', label: '🛠️ Suporte Técnico', description: 'Problemas técnicos e bugs' },
        { value: 'duvida', label: '❓ Dúvida', description: 'Perguntas sobre o sistema' },
        { value: 'sugestao', label: '💡 Sugestão', description: 'Ideias e melhorias' },
        { value: 'reclamacao', label: '⚠️ Reclamação', description: 'Problemas com o serviço' },
        { value: 'outro', label: '📋 Outro', description: 'Outros assuntos' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações
        if (!formData.name.trim()) {
            setError('Por favor, informe seu nome');
            return;
        }

        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Por favor, informe um email válido');
            return;
        }

        if (!formData.subject.trim()) {
            setError('Por favor, informe o assunto');
            return;
        }

        if (formData.message.trim().length < 10) {
            setError('A mensagem deve ter pelo menos 10 caracteres');
            return;
        }

        setLoading(true);

        try {
            const { ticket, error: ticketError } = await ticketService.createTicket(formData);

            if (ticketError || !ticket) {
                setError(ticketError || 'Erro ao criar ticket');
                setLoading(false);
                return;
            }

            setTicketNumber(ticket.ticket_number);
            setShowSuccess(true);

            // Limpar formulário
            setFormData({
                name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
                email: user?.email || '',
                category: 'suporte_tecnico',
                subject: '',
                message: ''
            });
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar mensagem');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Mensagem Enviada!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Seu ticket foi criado com sucesso
                        </p>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Número do Ticket</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                                #{ticketNumber}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Você receberá um email de confirmação em breve. Nossa equipe responderá o mais rápido possível!
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Voltar
                        </button>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Outro Ticket
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Botão Voltar */}
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Home className="w-5 h-5" />
                    <span>Voltar</span>
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                        <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Entre em Contato
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Envie sua mensagem e nossa equipe responderá em breve
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nome */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-colors"
                                placeholder="Seu nome"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>

                        {/* Categoria */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Tag className="w-4 h-4 inline mr-2" />
                                Categoria *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-colors"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {categories.find(c => c.value === formData.category)?.description}
                            </p>
                        </div>

                        {/* Assunto */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Assunto *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-colors"
                                placeholder="Resuma sua mensagem em poucas palavras"
                            />
                        </div>

                        {/* Mensagem */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mensagem *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-colors resize-none"
                                placeholder="Descreva sua solicitação, dúvida ou sugestão..."
                            />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Mínimo de 10 caracteres ({formData.message.length}/10)
                            </p>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Botão Enviar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Mensagem
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Ao enviar esta mensagem, você concorda com nossos{' '}
                            <a href="/termos" className="text-purple-600 dark:text-purple-400 hover:underline">
                                Termos de Serviço
                            </a>
                            {' '}e{' '}
                            <a href="/privacidade" className="text-purple-600 dark:text-purple-400 hover:underline">
                                Política de Privacidade
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
