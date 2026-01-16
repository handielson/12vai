import React, { useEffect, useState } from 'react';
import { urlService } from '../services/urlService';
import { Zap } from 'lucide-react';

interface RedirectHandlerProps {
    slug: string;
}

const RedirectHandler: React.FC<RedirectHandlerProps> = ({ slug }) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                console.log('🔍 [RedirectHandler] Buscando URL para slug:', slug);

                // Buscar a URL original pelo slug
                const url = await urlService.getUrlBySlug(slug);

                if (!url || !url.original_url) {
                    console.error('🔍 [RedirectHandler] URL não encontrada ou sem original_url');
                    setError('Link não encontrado');
                    return;
                }

                console.log('🔍 [RedirectHandler] Redirecionando para:', url.original_url);

                // Garantir que a URL tem protocolo
                let targetUrl = url.original_url;
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                    targetUrl = 'https://' + targetUrl;
                }

                // Redirecionar
                window.location.href = targetUrl;
            } catch (err: any) {
                console.error('🔍 [RedirectHandler] Erro:', err);
                setError('Link não encontrado');
            }
        };

        handleRedirect();
    }, [slug]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Zap className="text-slate-300 mx-auto mb-4" size={64} />
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">404 | O link não foi encontrado.</h1>
                    <p className="text-slate-500 mb-6">Este link não existe ou foi removido.</p>
                    <a
                        href="/"
                        className="text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                        ← Voltar à página inicial
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <Zap className="text-indigo-600 mx-auto mb-4 animate-pulse" fill="currentColor" size={48} />
                <p className="text-slate-600 font-medium">Redirecionando...</p>
            </div>
        </div>
    );
};

export default RedirectHandler;
