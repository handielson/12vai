import { Resend } from 'resend';

// Inicializar cliente Resend
export const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Configurações
export const EMAIL_CONFIG = {
    from: import.meta.env.VITE_RESEND_FROM_EMAIL || 'VaiEncurta <noreply@12vai.com>',
    replyTo: 'suporte@12vai.com',
    baseUrl: import.meta.env.VITE_APP_URL || 'https://12vai.com'
};

export default resend;
