import { supabase } from '../lib/supabase';
import { resend, EMAIL_CONFIG } from '../lib/resend';

export interface EmailPreferences {
    welcome_emails: boolean;
    weekly_reports: boolean;
    click_alerts: boolean;
    limit_alerts: boolean;
    expiry_alerts: boolean;
    upgrade_confirmations: boolean;
    report_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

export interface EmailLog {
    id: string;
    user_id: string;
    email_type: string;
    recipient: string;
    subject: string;
    status: string;
    resend_id: string | null;
    sent_at: string;
    opened_at: string | null;
    clicked_at: string | null;
}

class EmailService {
    /**
     * Obter preferências de email do usuário
     */
    async getPreferences(userId: string): Promise<EmailPreferences | null> {
        try {
            const { data, error } = await supabase.rpc('get_email_preferences', {
                p_user_id: userId
            });

            if (error) throw error;
            return data[0] || null;
        } catch (error) {
            console.error('Erro ao obter preferências:', error);
            return null;
        }
    }

    /**
     * Atualizar preferências de email
     */
    async updatePreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('update_email_preferences', {
                p_user_id: userId,
                p_welcome_emails: preferences.welcome_emails,
                p_weekly_reports: preferences.weekly_reports,
                p_click_alerts: preferences.click_alerts,
                p_limit_alerts: preferences.limit_alerts,
                p_expiry_alerts: preferences.expiry_alerts,
                p_upgrade_confirmations: preferences.upgrade_confirmations,
                p_report_frequency: preferences.report_frequency
            });

            if (error) throw error;
            return data || false;
        } catch (error) {
            console.error('Erro ao atualizar preferências:', error);
            return false;
        }
    }

    /**
     * Verificar se pode enviar email
     */
    async canSend(userId: string, emailType: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('can_send_email', {
                p_user_id: userId,
                p_email_type: emailType
            });

            if (error) throw error;
            return data || false;
        } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            return false;
        }
    }

    /**
     * Registrar envio de email
     */
    async logEmail(
        userId: string,
        emailType: string,
        recipient: string,
        subject: string,
        resendId?: string,
        metadata?: any
    ): Promise<string | null> {
        try {
            const { data, error } = await supabase.rpc('log_email_sent', {
                p_user_id: userId,
                p_email_type: emailType,
                p_recipient: recipient,
                p_subject: subject,
                p_resend_id: resendId,
                p_metadata: metadata
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao registrar email:', error);
            return null;
        }
    }

    /**
     * Enviar email de boas-vindas
     */
    async sendWelcomeEmail(userEmail: string, userName: string, userId: string): Promise<boolean> {
        try {
            // Verificar preferências
            const canSend = await this.canSend(userId, 'welcome');
            if (!canSend) {
                console.log('❌ Usuário não permite receber emails de boas-vindas');
                return false;
            }

            const subject = `Bem-vindo ao VaiEncurta, ${userName}! 🎉`;

            console.log('📧 Enviando email via Resend...');
            console.log('From:', EMAIL_CONFIG.from);
            console.log('To:', userEmail);
            console.log('Subject:', subject);

            // Enviar via Resend
            const { data, error } = await resend.emails.send({
                from: EMAIL_CONFIG.from,
                to: userEmail,
                subject,
                html: this.getWelcomeEmailHTML(userName)
            });

            if (error) {
                console.error('❌ Erro do Resend:', error);
                throw error;
            }

            console.log('✅ Email enviado! ID:', data?.id);

            // Registrar no banco
            await this.logEmail(userId, 'welcome', userEmail, subject, data?.id);

            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar email de boas-vindas:', error);
            // Mostrar erro detalhado
            if (error instanceof Error) {
                alert(`Erro: ${error.message}`);
            }
            return false;
        }
    }

    /**
     * Enviar alerta de limite
     */
    async sendLimitAlert(
        userEmail: string,
        userName: string,
        userId: string,
        usage: { current: number; limit: number; percentage: number }
    ): Promise<boolean> {
        try {
            const canSend = await this.canSend(userId, 'limit_alert');
            if (!canSend) return false;

            const subject = `⚠️ Você atingiu ${usage.percentage}% do seu plano`;

            const { data, error } = await resend.emails.send({
                from: EMAIL_CONFIG.from,
                to: userEmail,
                subject,
                html: this.getLimitAlertHTML(userName, usage)
            });

            if (error) throw error;

            await this.logEmail(userId, 'limit_alert', userEmail, subject, data?.id, { usage });

            return true;
        } catch (error) {
            console.error('Erro ao enviar alerta de limite:', error);
            return false;
        }
    }

    /**
     * HTML do email de boas-vindas (temporário - será substituído por React Email)
     */
    private getWelcomeEmailHTML(userName: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Bem-vindo ao VaiEncurta!</h1>
        </div>
        <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Estamos muito felizes em ter você conosco! O VaiEncurta é a maneira mais fácil de criar, gerenciar e rastrear links encurtados.</p>
            
            <h3>🚀 Primeiros Passos:</h3>
            <ul>
                <li>Crie seu primeiro link encurtado</li>
                <li>Personalize com slug customizado</li>
                <li>Acompanhe cliques em tempo real</li>
                <li>Gere QR Codes personalizados</li>
            </ul>
            
            <a href="${EMAIL_CONFIG.baseUrl}" class="button">Criar Primeiro Link</a>
            
            <p>Se precisar de ajuda, nossa equipe está sempre disponível em <a href="mailto:suporte@12vai.com">suporte@12vai.com</a></p>
        </div>
        <div class="footer">
            <p>© 2026 VaiEncurta. Todos os direitos reservados.</p>
            <p><a href="${EMAIL_CONFIG.baseUrl}/settings">Gerenciar Preferências</a></p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * HTML do alerta de limite
     */
    private getLimitAlertHTML(userName: string, usage: { current: number; limit: number; percentage: number }): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .usage-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
        .usage-fill { background: linear-gradient(90deg, #f59e0b 0%, #dc2626 100%); height: 100%; width: ${usage.percentage}%; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Alerta de Limite</h1>
        </div>
        <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Você está usando <strong>${usage.percentage}%</strong> do seu plano atual.</p>
            
            <div class="usage-bar">
                <div class="usage-fill"></div>
            </div>
            
            <p><strong>${usage.current.toLocaleString()}</strong> de <strong>${usage.limit.toLocaleString()}</strong> cliques usados</p>
            
            <p>Para continuar sem interrupções, considere fazer upgrade para um plano superior.</p>
            
            <a href="${EMAIL_CONFIG.baseUrl}/pricing" class="button">Ver Planos</a>
        </div>
        <div class="footer">
            <p>© 2026 VaiEncurta. Todos os direitos reservados.</p>
            <p><a href="${EMAIL_CONFIG.baseUrl}/settings">Gerenciar Preferências</a></p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Obter logs de email do usuário
     */
    async getUserLogs(userId: string, limit: number = 50): Promise<EmailLog[]> {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .eq('user_id', userId)
                .order('sent_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erro ao obter logs:', error);
            return [];
        }
    }

    /**
     * Obter estatísticas de emails
     */
    async getStats(userId?: string): Promise<any> {
        try {
            const { data, error } = await supabase.rpc('get_email_stats', {
                p_user_id: userId
            });

            if (error) throw error;
            return data[0] || null;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return null;
        }
    }
}

export const emailService = new EmailService();
export default emailService;
