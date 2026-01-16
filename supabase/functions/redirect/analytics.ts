import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { UAParser } from 'https://esm.sh/ua-parser-js@1.0.37'

interface AnalyticsData {
    url_id: string
    request: Request
    ip: string
}

export async function captureAnalytics(
    supabase: SupabaseClient,
    data: AnalyticsData
) {
    try {
        const ua = new UAParser(data.request.headers.get('user-agent') || '')
        const referer = data.request.headers.get('referer')
        const url = new URL(data.request.url)

        // Extrair UTM parameters
        const utm_source = url.searchParams.get('utm_source')
        const utm_medium = url.searchParams.get('utm_medium')
        const utm_campaign = url.searchParams.get('utm_campaign')

        // Parse device info
        const device = ua.getDevice()
        const browser = ua.getBrowser()
        const os = ua.getOS()

        // Determinar tipo de dispositivo
        let deviceType = 'desktop'
        if (device.type === 'mobile') deviceType = 'mobile'
        else if (device.type === 'tablet') deviceType = 'tablet'

        // Inserir no banco
        const { error } = await supabase
            .from('clicks')
            .insert({
                url_id: data.url_id,
                ip_address: data.ip,
                user_agent: data.request.headers.get('user-agent'),
                referer,
                device_type: deviceType,
                browser: browser.name || 'Unknown',
                os: os.name || 'Unknown',
                utm_source,
                utm_medium,
                utm_campaign,
            })

        if (error) {
            console.error('Failed to insert click:', error)
            throw error
        }

        // Incrementar contador de cliques na URL
        await supabase.rpc('increment_url_clicks', { url_id: data.url_id })

    } catch (error) {
        console.error('Analytics capture error:', error)
        throw error
    }
}
