import { supabase } from '../lib/supabase';
import { createHash, randomBytes } from 'crypto';

export interface ApiKey {
    id: string;
    user_id: string;
    key_hash: string;
    name: string;
    prefix: string;
    last_used_at: string | null;
    created_at: string;
    expires_at: string | null;
    active: boolean;
}

export interface ApiRequest {
    id: string;
    api_key_id: string | null;
    user_id: string;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms: number | null;
    ip_address: string | null;
    user_agent: string | null;
    error_message: string | null;
    created_at: string;
}

export interface ApiStats {
    total_requests: number;
    requests_today: number;
    requests_this_week: number;
    requests_this_month: number;
    avg_response_time_ms: number;
    success_rate: number;
    most_used_endpoint: string;
}

export interface RateLimitInfo {
    allowed: boolean;
    limit_per_hour: number;
    current_count: number;
    reset_at: string;
}

class ApiKeyService {
    /**
     * Gerar nova API key
     */
    generateApiKey(environment: 'live' | 'test' = 'live'): string {
        const randomPart = randomBytes(16).toString('hex');
        return `vai_${environment}_${randomPart}`;
    }

    /**
     * Hash da API key para armazenamento seguro
     */
    hashApiKey(apiKey: string): string {
        return createHash('sha256').update(apiKey).digest('hex');
    }

    /**
     * Criar nova API key para usuário
     */
    async createApiKey(
        userId: string,
        name: string,
        environment: 'live' | 'test' = 'live',
        expiresAt?: string
    ): Promise<{ apiKey: ApiKey; plainKey: string } | null> {
        try {
            // Gerar chave
            const plainKey = this.generateApiKey(environment);
            const keyHash = this.hashApiKey(plainKey);
            const prefix = `vai_${environment}_`;

            // Inserir no banco
            const { data, error } = await supabase
                .from('api_keys')
                .insert({
                    user_id: userId,
                    key_hash: keyHash,
                    name,
                    prefix,
                    expires_at: expiresAt,
                    active: true
                })
                .select()
                .single();

            if (error) throw error;

            return {
                apiKey: data,
                plainKey // Retornar apenas UMA VEZ
            };
        } catch (error) {
            console.error('Erro ao criar API key:', error);
            return null;
        }
    }

    /**
     * Listar API keys do usuário
     */
    async getUserApiKeys(userId: string): Promise<ApiKey[]> {
        try {
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao listar API keys:', error);
            return [];
        }
    }

    /**
     * Revogar (desativar) API key
     */
    async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('api_keys')
                .update({ active: false })
                .eq('id', keyId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao revogar API key:', error);
            return false;
        }
    }

    /**
     * Deletar API key permanentemente
     */
    async deleteApiKey(keyId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', keyId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erro ao deletar API key:', error);
            return false;
        }
    }

    /**
     * Validar API key
     */
    async validateApiKey(plainKey: string): Promise<{
        valid: boolean;
        userId?: string;
        apiKeyId?: string;
        planType?: string;
    }> {
        try {
            const keyHash = this.hashApiKey(plainKey);

            const { data, error } = await supabase.rpc('validate_api_key', {
                p_key_hash: keyHash
            });

            if (error) throw error;

            const result = data[0];
            return {
                valid: result.valid,
                userId: result.user_id,
                apiKeyId: result.api_key_id,
                planType: result.plan_type
            };
        } catch (error) {
            console.error('Erro ao validar API key:', error);
            return { valid: false };
        }
    }

    /**
     * Verificar rate limit
     */
    async checkRateLimit(userId: string, planType: string): Promise<RateLimitInfo> {
        try {
            const { data, error } = await supabase.rpc('check_rate_limit', {
                p_user_id: userId,
                p_plan_type: planType
            });

            if (error) throw error;

            return data[0];
        } catch (error) {
            console.error('Erro ao verificar rate limit:', error);
            return {
                allowed: false,
                limit_per_hour: 0,
                current_count: 0,
                reset_at: new Date().toISOString()
            };
        }
    }

    /**
     * Registrar requisição da API
     */
    async logApiRequest(
        apiKeyId: string | null,
        userId: string,
        endpoint: string,
        method: string,
        statusCode: number,
        responseTimeMs?: number,
        ipAddress?: string,
        userAgent?: string,
        errorMessage?: string
    ): Promise<string | null> {
        try {
            const { data, error } = await supabase.rpc('log_api_request', {
                p_api_key_id: apiKeyId,
                p_user_id: userId,
                p_endpoint: endpoint,
                p_method: method,
                p_status_code: statusCode,
                p_response_time_ms: responseTimeMs,
                p_ip_address: ipAddress,
                p_user_agent: userAgent,
                p_error_message: errorMessage
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao registrar requisição:', error);
            return null;
        }
    }

    /**
     * Obter estatísticas de API do usuário
     */
    async getApiStats(userId: string): Promise<ApiStats | null> {
        try {
            const { data, error } = await supabase.rpc('get_api_stats', {
                p_user_id: userId
            });

            if (error) throw error;
            return data[0] || null;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return null;
        }
    }

    /**
     * Obter requisições recentes
     */
    async getRecentRequests(userId: string, limit: number = 50): Promise<ApiRequest[]> {
        try {
            const { data, error } = await supabase
                .from('api_requests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao obter requisições:', error);
            return [];
        }
    }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
