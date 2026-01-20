import { supabase } from '../lib/supabase';

export interface SupportTicket {
    id: string;
    ticket_number: string;
    user_id?: string;
    user_email: string;
    user_name: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: 'suporte_tecnico' | 'duvida' | 'sugestao' | 'reclamacao' | 'outro';
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    assigned_to?: string;
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    user_id?: string;
    sender_name: string;
    sender_email: string;
    message: string;
    is_admin: boolean;
    is_internal: boolean;
    created_at: string;
}

export interface CreateTicketData {
    name: string;
    email: string;
    category: SupportTicket['category'];
    subject: string;
    message: string;
}

export interface TicketWithMessages extends SupportTicket {
    messages: TicketMessage[];
    message_count?: number;
}

class TicketService {
    /**
     * Criar novo ticket de suporte
     */
    async createTicket(data: CreateTicketData): Promise<{ ticket: SupportTicket; error?: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Criar ticket
            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user?.id || null,
                    user_email: data.email,
                    user_name: data.name,
                    subject: data.subject,
                    category: data.category,
                    status: 'open',
                    priority: 'normal'
                })
                .select()
                .single();

            if (ticketError) {
                console.error('Error creating ticket:', ticketError);
                return { ticket: null as any, error: ticketError.message };
            }

            // Criar primeira mensagem
            const { error: messageError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticket.id,
                    user_id: user?.id || null,
                    sender_name: data.name,
                    sender_email: data.email,
                    message: data.message,
                    is_admin: false,
                    is_internal: false
                });

            if (messageError) {
                console.error('Error creating message:', messageError);
                // Não retorna erro, pois o ticket já foi criado
            }

            return { ticket };
        } catch (error: any) {
            console.error('Error in createTicket:', error);
            return { ticket: null as any, error: error.message };
        }
    }

    /**
     * Listar tickets (admin)
     */
    async listTickets(filters?: {
        status?: string;
        priority?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ tickets: TicketWithMessages[]; total: number; error?: string }> {
        try {
            const page = filters?.page || 1;
            const limit = filters?.limit || 20;
            const offset = (page - 1) * limit;

            let query = supabase
                .from('support_tickets')
                .select('*, messages:ticket_messages(count)', { count: 'exact' });

            // Filtros
            if (filters?.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }

            if (filters?.priority) {
                query = query.eq('priority', filters.priority);
            }

            if (filters?.search) {
                query = query.or(`ticket_number.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
            }

            // Ordenação e paginação
            query = query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                console.error('Error listing tickets:', error);
                return { tickets: [], total: 0, error: error.message };
            }

            return { tickets: data || [], total: count || 0 };
        } catch (error: any) {
            console.error('Error in listTickets:', error);
            return { tickets: [], total: 0, error: error.message };
        }
    }

    /**
     * Obter detalhes de um ticket com todas as mensagens
     */
    async getTicket(ticketId: string): Promise<{ ticket: TicketWithMessages | null; error?: string }> {
        try {
            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('id', ticketId)
                .single();

            if (ticketError) {
                console.error('Error getting ticket:', ticketError);
                return { ticket: null, error: ticketError.message };
            }

            const { data: messages, error: messagesError } = await supabase
                .from('ticket_messages')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (messagesError) {
                console.error('Error getting messages:', messagesError);
                return { ticket: null, error: messagesError.message };
            }

            return {
                ticket: {
                    ...ticket,
                    messages: messages || []
                }
            };
        } catch (error: any) {
            console.error('Error in getTicket:', error);
            return { ticket: null, error: error.message };
        }
    }

    /**
     * Adicionar mensagem a um ticket
     */
    async addMessage(
        ticketId: string,
        message: string,
        isInternal: boolean = false
    ): Promise<{ message: TicketMessage | null; error?: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { message: null, error: 'Usuário não autenticado' };
            }

            // Verificar se usuário é admin
            const { data: userData } = await supabase
                .from('users')
                .select('role, name, email')
                .eq('id', user.id)
                .single();

            const isAdmin = userData?.role === 'admin';

            const { data: newMessage, error } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticketId,
                    user_id: user.id,
                    sender_name: userData?.name || user.email || 'Usuário',
                    sender_email: userData?.email || user.email || '',
                    message,
                    is_admin: isAdmin,
                    is_internal: isInternal
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding message:', error);
                return { message: null, error: error.message };
            }

            // Atualizar updated_at do ticket
            await supabase
                .from('support_tickets')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', ticketId);

            return { message: newMessage };
        } catch (error: any) {
            console.error('Error in addMessage:', error);
            return { message: null, error: error.message };
        }
    }

    /**
     * Atualizar status/prioridade de um ticket (admin)
     */
    async updateTicket(
        ticketId: string,
        updates: {
            status?: SupportTicket['status'];
            priority?: SupportTicket['priority'];
            assigned_to?: string;
            category?: SupportTicket['category'];
        }
    ): Promise<{ ticket: SupportTicket | null; error?: string }> {
        try {
            const updateData: any = { ...updates };

            // Se status mudou para resolved, definir resolved_at
            if (updates.status === 'resolved') {
                updateData.resolved_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('support_tickets')
                .update(updateData)
                .eq('id', ticketId)
                .select()
                .single();

            if (error) {
                console.error('Error updating ticket:', error);
                return { ticket: null, error: error.message };
            }

            return { ticket: data };
        } catch (error: any) {
            console.error('Error in updateTicket:', error);
            return { ticket: null, error: error.message };
        }
    }

    /**
     * Obter estatísticas de tickets (admin)
     */
    async getStats(): Promise<{
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
    }> {
        try {
            const { count: total } = await supabase
                .from('support_tickets')
                .select('*', { count: 'exact', head: true });

            const { count: open } = await supabase
                .from('support_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'open');

            const { count: in_progress } = await supabase
                .from('support_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'in_progress');

            const { count: resolved } = await supabase
                .from('support_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'resolved');

            const { count: closed } = await supabase
                .from('support_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'closed');

            return {
                total: total || 0,
                open: open || 0,
                in_progress: in_progress || 0,
                resolved: resolved || 0,
                closed: closed || 0
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
        }
    }
}

export const ticketService = new TicketService();
