import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('=== SEND EMAIL API CALLED ===');

    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({
                error: 'Missing required fields: to, subject, html'
            });
        }

        console.log('Sending email to:', to);
        console.log('Subject:', subject);

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || '12Vai <suporte@12vai.com>',
            to,
            subject,
            html,
            text: text || undefined
        });

        if (error) {
            console.error('❌ Resend error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('✅ Email sent successfully! ID:', data.id);

        return res.json({
            success: true,
            id: data.id,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Send email error:', error);
        return res.status(500).json({
            error: error.message || 'Failed to send email'
        });
    }
}
