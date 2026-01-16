import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { captureAnalytics } from './analytics.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const slug = url.pathname.slice(1) // Remove leading "/"

        // Validar slug
        if (!slug || slug.length < 3) {
            return new Response('Invalid URL', {
                status: 400,
                headers: corsHeaders
            })
        }

        // Conectar ao Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Buscar URL no banco
        const { data: urlData, error } = await supabase
            .from('urls')
            .select('*')
            .eq('short_slug', slug)
            .eq('active', true)
            .single()

        if (error || !urlData) {
            return new Response('Link not found', {
                status: 404,
                headers: corsHeaders
            })
        }

        // Verificar expiração
        if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
            return new Response('Link expired', {
                status: 410,
                headers: corsHeaders
            })
        }

        // Capturar analytics (async, não bloqueia redirect)
        const clientIp = req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'unknown'

        captureAnalytics(supabase, {
            url_id: urlData.id,
            request: req,
            ip: clientIp
        }).catch(err => console.error('Analytics error:', err))

        // Redirecionar
        return Response.redirect(urlData.original_url, 301)

    } catch (error) {
        console.error('Redirect error:', error)
        return new Response('Internal server error', {
            status: 500,
            headers: corsHeaders
        })
    }
})
