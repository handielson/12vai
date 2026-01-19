import React, { useEffect, useState } from 'react';
import { urlService } from '../services/urlService';
import { Zap } from 'lucide-react';
import { Url } from '../types';
import PasswordPrompt from './PasswordPrompt';

interface RedirectHandlerProps {
    slug: string;
}

const RedirectHandler: React.FC<RedirectHandlerProps> = ({ slug }) => {
    const [error, setError] = useState<string | null>(null);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [urlData, setUrlData] = useState<Url | null>(null);
    const [passwordError, setPasswordError] = useState('');

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

                // Verificar se tem senha
                if (url.password) {
                    // Verificar se já foi validado nesta sessão
                    const sessionKey = `pwd_validated_${slug}`;
                    const isValidated = sessionStorage.getItem(sessionKey);

                    if (isValidated) {
                        // Já validado, redirecionar direto
                        redirectToUrl(url.original_url);
                        return;
                    }

                    // Precisa de senha
                    setUrlData(url);
                    setNeedsPassword(true);
                    return;
                }

                // Sem senha, redirecionar direto
                console.log('🔍 [RedirectHandler] Redirecionando para:', url.original_url);
                redirectToUrl(url.original_url);
            } catch (err: any) {
                console.error('🔍 [RedirectHandler] Erro:', err);
                setError('Link não encontrado');
            }
        };

        handleRedirect();
    }, [slug]);

    const redirectToUrl = (originalUrl: string) => {
        // Garantir que a URL tem protocolo
        let targetUrl = originalUrl;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        // Redirecionar
        window.location.href = targetUrl;
    };

    const handlePasswordSubmit = (password: string) => {
        if (!urlData) return;

        // Validar senha
        if (password === urlData.password) {
            // Senha correta! Armazenar validação na sessão
            const sessionKey = `pwd_validated_${slug}`;
            sessionStorage.setItem(sessionKey, 'true');

            // Redirecionar
            redirectToUrl(urlData.original_url);
        } else {
            // Senha incorreta
            setPasswordError('Senha incorreta. Tente novamente.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Zap className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={64} />
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">404 | O link não foi encontrado.</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Este link não existe ou foi removido.</p>
                    <a
                        href="/"
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold"
                    >
                        ← Voltar à página inicial
                    </a>
                </div>
            </div>
        );
    }

    if (needsPassword && urlData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <PasswordPrompt
                    hint={urlData.password_hint}
                    onSubmit={handlePasswordSubmit}
                    error={passwordError}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <Zap className="text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-pulse" fill="currentColor" size={48} />
                <p className="text-slate-600 dark:text-slate-300 font-medium">Redirecionando...</p>
            </div>
        </div>
    );
};

export default RedirectHandler;
