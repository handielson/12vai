import { supabase } from '../lib/supabase';

export type DocumentType = 'terms' | 'privacy' | 'cookies';

export interface LegalDocument {
    id: string;
    type: DocumentType;
    title: string;
    content: string; // Markdown
    version: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserAcceptance {
    id: string;
    user_id: string;
    document_id: string;
    document_type: DocumentType;
    document_version: number;
    ip_address?: string;
    user_agent?: string;
    accepted_at: string;
}

export interface AcceptanceStatus {
    needs_acceptance: boolean;
    pending_documents: DocumentType[];
}

class TermsService {
    /**
     * Buscar documentos ativos
     */
    async getActiveDocuments(): Promise<LegalDocument[]> {
        try {
            const { data, error } = await supabase.rpc('get_active_documents');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
            return [];
        }
    }

    /**
     * Verificar se usuário precisa aceitar termos
     */
    async checkUserAcceptance(userId: string): Promise<AcceptanceStatus> {
        try {
            const { data, error } = await supabase.rpc('check_user_acceptance', {
                p_user_id: userId
            });

            if (error) throw error;

            return data[0] || { needs_acceptance: false, pending_documents: [] };
        } catch (error) {
            console.error('Erro ao verificar aceite:', error);
            return { needs_acceptance: false, pending_documents: [] };
        }
    }

    /**
     * Registrar aceite do usuário
     */
    async recordAcceptance(
        userId: string,
        documentId: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('record_acceptance', {
                p_user_id: userId,
                p_document_id: documentId,
                p_ip_address: ipAddress,
                p_user_agent: userAgent
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao registrar aceite:', error);
            return false;
        }
    }

    /**
     * Registrar múltiplos aceites
     */
    async recordMultipleAcceptances(
        userId: string,
        documentIds: string[]
    ): Promise<boolean> {
        try {
            const ipAddress = await this.getClientIP();
            const userAgent = navigator.userAgent;

            const promises = documentIds.map(docId =>
                this.recordAcceptance(userId, docId, ipAddress, userAgent)
            );

            const results = await Promise.all(promises);
            return results.every(r => r === true);
        } catch (error) {
            console.error('Erro ao registrar aceites:', error);
            return false;
        }
    }

    /**
     * Buscar aceites do usuário
     */
    async getUserAcceptances(userId: string): Promise<UserAcceptance[]> {
        try {
            const { data, error } = await supabase
                .from('user_acceptances')
                .select('*')
                .eq('user_id', userId)
                .order('accepted_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao buscar aceites:', error);
            return [];
        }
    }

    /**
     * Atualizar documento (Admin)
     */
    async updateDocument(
        documentId: string,
        content: string,
        title?: string
    ): Promise<boolean> {
        try {
            const updates: any = { content };
            if (title) updates.title = title;

            const { error } = await supabase
                .from('legal_documents')
                .update(updates)
                .eq('id', documentId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao atualizar documento:', error);
            return false;
        }
    }

    /**
     * Publicar nova versão (Admin)
     */
    async publishNewVersion(
        documentId: string,
        adminUserId: string
    ): Promise<number | null> {
        try {
            const { data, error } = await supabase.rpc('publish_new_version', {
                p_document_id: documentId,
                p_admin_user_id: adminUserId
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao publicar versão:', error);
            return null;
        }
    }

    /**
     * Obter IP do cliente (aproximado)
     */
    private async getClientIP(): Promise<string | undefined> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return undefined;
        }
    }
}

export const termsService = new TermsService();
export default termsService;
