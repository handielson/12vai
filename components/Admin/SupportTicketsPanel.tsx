import React, { useState, useEffect } from 'react';
import {
    MessageSquare, Search, Filter, Clock, CheckCircle, XCircle,
    AlertCircle, Send, Eye, User, Mail, Calendar, Tag, X, Loader
} from 'lucide-react';
import { ticketService, SupportTicket, TicketWithMessages, TicketMessage } from '../../services/ticketService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SupportTicketsPanel() {
    const [tickets, setTickets] = useState<TicketWithMessages[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
    const [selectedTicket, setSelectedTicket] = useState<TicketWithMessages | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadTickets();
        loadStats();
    }, [statusFilter, searchQuery, page]);

    const loadTickets = async () => {
        setLoading(true);
        const { tickets: data, total: count } = await ticketService.listTickets({
            status: statusFilter,
            search: searchQuery,
            page,
            limit: 20
        });
        setTickets(data);
        setTotal(count);
        setLoading(false);
    };

    const loadStats = async () => {
        const data = await ticketService.getStats();
        setStats(data);
    };

    const openTicket = async (ticket: TicketWithMessages) => {
        const { ticket: fullTicket } = await ticketService.getTicket(ticket.id);
        if (fullTicket) {
            setSelectedTicket(fullTicket);
            setShowModal(true);
        }
    };

    const handleSendReply = async () => {
        if (!selectedTicket || !replyMessage.trim()) return;

        setSending(true);
        const { message, error } = await ticketService.addMessage(
            selectedTicket.id,
            replyMessage,
            isInternal
        );

        if (!error && message) {
            setSelectedTicket({
                ...selectedTicket,
                messages: [...selectedTicket.messages, message]
            });
            setReplyMessage('');
            setIsInternal(false);
            loadTickets();
        }
        setSending(false);
    };

    const handleUpdateStatus = async (status: SupportTicket['status']) => {
        if (!selectedTicket) return;

        const { ticket } = await ticketService.updateTicket(selectedTicket.id, { status });
        if (ticket) {
            setSelectedTicket({ ...selectedTicket, ...ticket });
            loadTickets();
            loadStats();
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            open: { label: 'Aberto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
            in_progress: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
            resolved: { label: 'Resolvido', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            closed: { label: 'Fechado', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: XCircle }
        };
        const badge = badges[status as keyof typeof badges] || badges.open;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            suporte_tecnico: '🛠️ Suporte Técnico',
            duvida: '❓ Dúvida',
            sugestao: '💡 Sugestão',
            reclamacao: '⚠️ Reclamação',
            outro: '📋 Outro'
        };
        return labels[category] || category;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header com Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-purple-600" />
                        Tickets de Suporte
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gerencie solicitações de suporte dos clientes
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                    { label: 'Abertos', value: stats.open, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                    { label: 'Em Andamento', value: stats.in_progress, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                    { label: 'Resolvidos', value: stats.resolved, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
                    { label: 'Fechados', value: stats.closed, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Busca */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por número, email ou assunto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                        />
                    </div>

                    {/* Filtro de Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="open">Abertos</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="resolved">Resolvidos</option>
                        <option value="closed">Fechados</option>
                    </select>
                </div>
            </div>

            {/* Lista de Tickets */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Carregando tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Nenhum ticket encontrado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ticket
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Assunto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                #{ticket.ticket_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 dark:text-white">{ticket.user_name}</div>
                                                <div className="text-gray-500 dark:text-gray-400">{ticket.user_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                {ticket.subject}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getCategoryLabel(ticket.category)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => openTicket(ticket)}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Paginação */}
            {total > 20 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} tickets
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * 20 >= total}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Detalhes do Ticket */}
            {showModal && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header do Modal */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Ticket #{selectedTicket.ticket_number}
                                        </h3>
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedTicket.subject}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {selectedTicket.user_name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            {selectedTicket.user_email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(selectedTicket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            {getCategoryLabel(selectedTicket.category)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Botões de Status */}
                            <div className="flex gap-2 mt-4">
                                {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleUpdateStatus(status as SupportTicket['status'])}
                                        disabled={selectedTicket.status === status}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTicket.status === status
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            } disabled:opacity-50`}
                                    >
                                        {status === 'open' && 'Abrir'}
                                        {status === 'in_progress' && 'Em Andamento'}
                                        {status === 'resolved' && 'Resolver'}
                                        {status === 'closed' && 'Fechar'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timeline de Mensagens */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedTicket.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.is_admin ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.is_admin
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {msg.is_admin ? '👨‍💼' : '👤'}
                                    </div>
                                    <div className={`flex-1 max-w-[70%] ${msg.is_admin ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block p-4 rounded-lg ${msg.is_internal
                                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700'
                                                : msg.is_admin
                                                    ? 'bg-purple-100 dark:bg-purple-900/30'
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                    {msg.sender_name}
                                                </span>
                                                {msg.is_internal && (
                                                    <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                                                        Nota Interna
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Campo de Resposta */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Digite sua resposta..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white resize-none"
                                />
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        Nota interna (não visível ao cliente)
                                    </label>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyMessage.trim() || sending}
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {sending ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Enviar Resposta
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
