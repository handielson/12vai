import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, html, type } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Enviar via Resend
        const { data, error } = await resend.emails.send({
            from: process.env.VITE_RESEND_FROM_EMAIL || '12Vai <noreply@12vai.com>',
            to,
            subject,
            html
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            success: true,
            id: data?.id
        });

    } catch (error) {
        console.error('Send email error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
