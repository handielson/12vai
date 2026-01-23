import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CompanySettings {
    company_name: string;
    logo_url: string | null;
    favicon_url: string | null;
}

export const useCompanySettings = () => {
    useEffect(() => {
        const loadCompanySettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('company_settings')
                    .select('company_name, logo_url, favicon_url')
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.log('Erro ao carregar configurações:', error);
                    return;
                }

                if (data) {
                    // Aplicar favicon
                    if (data.favicon_url) {
                        updateFavicon(data.favicon_url);
                    }

                    // Atualizar título da página se necessário
                    if (data.company_name && !document.title.includes(data.company_name)) {
                        // Apenas atualiza se o título ainda for o padrão
                        if (document.title === '12Vai' || document.title === '12vai.com') {
                            document.title = data.company_name;
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar configurações da empresa:', error);
            }
        };

        loadCompanySettings();
    }, []);
};

const updateFavicon = (faviconUrl: string) => {
    // Remove favicons existentes
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    // Adiciona novo favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = faviconUrl;
    document.head.appendChild(link);

    // Adiciona também como apple-touch-icon para iOS
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = faviconUrl;
    document.head.appendChild(appleLink);

    console.log('✅ Favicon atualizado:', faviconUrl);
};
