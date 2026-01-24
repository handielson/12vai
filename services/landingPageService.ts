import { supabase } from '../lib/supabase';

// =====================================================
// Landing Page Service
// Manages landing page content and settings
// =====================================================

export interface LandingPageFeature {
    icon: string;
    title: string;
    desc: string;
}

export interface LandingPageStat {
    number: string;
    label: string;
}

export interface LandingPageTestimonial {
    name: string;
    role: string;
    text: string;
    rating: number;
}

export interface LandingPageFAQ {
    q: string;
    a: string;
}

export interface LandingPageColors {
    primary: string;
    secondary: string;
    accent: string;
}

export interface LandingPageSocialProof {
    users: string;
    rating: string;
    badge: string;
}

export interface LandingPageSettings {
    id: string;
    hero_badge_text: string;
    hero_title: string;
    hero_title_gradient: string;
    hero_subtitle: string;
    features: LandingPageFeature[];
    stats: LandingPageStat[];
    testimonials: LandingPageTestimonial[];
    faq: LandingPageFAQ[];
    colors: LandingPageColors;
    social_proof: LandingPageSocialProof;
    final_cta_title: string;
    final_cta_subtitle: string;
    updated_at?: string;
    updated_by?: string;
}

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

class LandingPageService {
    /**
     * Get current landing page settings
     */
    async getLandingPageSettings(): Promise<LandingPageSettings | null> {
        try {
            const { data, error } = await supabase
                .from('landing_page_settings')
                .select('*')
                .eq('id', SINGLETON_ID)
                .single();

            if (error) {
                console.error('Error fetching landing page settings:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getLandingPageSettings:', error);
            return null;
        }
    }

    /**
     * Update landing page settings
     */
    async updateLandingPageSettings(
        settings: Partial<LandingPageSettings>,
        userId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('landing_page_settings')
                .update({
                    ...settings,
                    updated_at: new Date().toISOString(),
                    updated_by: userId,
                })
                .eq('id', SINGLETON_ID);

            if (error) {
                console.error('Error updating landing page settings:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error in updateLandingPageSettings:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get default settings (fallback)
     */
    getDefaultSettings(): LandingPageSettings {
        return {
            id: SINGLETON_ID,
            hero_badge_text: '⚡ Mais de 10.000 links encurtados',
            hero_title: 'Transforme Links em',
            hero_title_gradient: 'Vendas Reais',
            hero_subtitle: 'O encurtador brasileiro que aumenta suas conversões com links profissionais, analytics poderoso e QR Codes personalizados.',
            features: [
                {
                    icon: '🎯',
                    title: 'Links Personalizados',
                    desc: 'Crie links memoráveis como 12vai.com/oferta que seus clientes confiam e clicam mais',
                },
                {
                    icon: '📊',
                    title: 'Analytics em Tempo Real',
                    desc: 'Saiba exatamente quantos cliques, de onde vieram e qual campanha converte melhor',
                },
                {
                    icon: '📱',
                    title: 'QR Codes Personalizados',
                    desc: 'Gere QR Codes com sua marca, cores e logo para materiais físicos e digitais',
                },
                {
                    icon: '🔒',
                    title: 'Links Protegidos',
                    desc: 'Adicione senha aos seus links para conteúdo exclusivo e lançamentos VIP',
                },
                {
                    icon: '⚡',
                    title: 'Redirecionamento Rápido',
                    desc: 'Infraestrutura de alta performance que carrega em menos de 100ms',
                },
                {
                    icon: '🎨',
                    title: 'Bio Link Profissional',
                    desc: 'Centralize todos seus links em uma página bonita para Instagram e TikTok',
                },
            ],
            stats: [
                { number: '10K+', label: 'Links Criados' },
                { number: '500+', label: 'Usuários Ativos' },
                { number: '99.9%', label: 'Uptime' },
                { number: '<100ms', label: 'Velocidade' },
            ],
            testimonials: [
                {
                    name: 'Maria Silva',
                    role: 'Afiliada Digital',
                    text: 'Meus cliques aumentaram 40% depois que comecei a usar links personalizados. O analytics me ajuda a saber exatamente qual campanha funciona!',
                    rating: 5,
                },
                {
                    name: 'João Santos',
                    role: 'E-commerce',
                    text: 'O QR Code personalizado ficou perfeito nas embalagens. Agora consigo rastrear quantos clientes escaneiam e compram novamente.',
                    rating: 5,
                },
                {
                    name: 'Ana Costa',
                    role: 'Influenciadora',
                    text: 'Uso o 12Vai para todos meus links do Instagram. É rápido, profissional e meus seguidores confiam mais nos links curtos.',
                    rating: 5,
                },
            ],
            faq: [
                {
                    q: 'Preciso de cartão de crédito para começar?',
                    a: 'Não! O plano Free é 100% gratuito e não requer cartão de crédito. Você pode criar até 100 links sem pagar nada.',
                },
                {
                    q: 'Posso cancelar a qualquer momento?',
                    a: 'Sim! Não há fidelidade. Você pode cancelar seu plano quando quiser e continuar usando o plano Free.',
                },
                {
                    q: 'Os links param de funcionar se eu cancelar?',
                    a: 'Não! Seus links continuam funcionando mesmo se você cancelar. Você só perde acesso aos recursos premium.',
                },
                {
                    q: 'Vocês têm suporte em português?',
                    a: 'Sim! Somos 100% brasileiros e todo nosso suporte é em português.',
                },
            ],
            colors: {
                primary: '#4f46e5',
                secondary: '#9333ea',
                accent: '#ec4899',
            },
            social_proof: {
                users: '+500 usuários ativos',
                rating: '4.9/5 de satisfação',
                badge: 'Sem cartão de crédito',
            },
            final_cta_title: 'Pronto para transformar seus links em vendas?',
            final_cta_subtitle: 'Junte-se a centenas de empreendedores que já aumentaram suas conversões',
        };
    }

    /**
     * Reset to default settings
     */
    async resetToDefaults(userId: string): Promise<{ success: boolean; error?: string }> {
        const defaults = this.getDefaultSettings();
        return this.updateLandingPageSettings(defaults, userId);
    }
}

export const landingPageService = new LandingPageService();
