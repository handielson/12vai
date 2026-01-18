

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { urlService } from '../services/urlService';
import { User } from '../types';
import { canCreateUrl, getUrlLimit, formatLimit } from '../lib/planLimits';

interface Props {
  user: User;
  onCreated: () => void;
}

const UrlCreator: React.FC<Props> = ({ user, onCreated }) => {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string; isPremium: boolean } | null>(null);

  // Validar slug quando mudar
  useEffect(() => {
    if (!slug) {
      setValidation(null);
      return;
    }

    const validateAsync = async () => {
      const result = await urlService.validateSlug(slug, user.plan);
      setValidation(result);
    };

    const debounce = setTimeout(validateAsync, 300);
    return () => clearTimeout(debounce);
  }, [slug, user.plan]);

  const handleCreate = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // Verificar limite de URLs
      const urls = await urlService.getMyUrls(user.id);
      const limit = getUrlLimit(user.plan, user.custom_url_limit);

      if (!canCreateUrl(urls.length, user.plan, user.custom_url_limit)) {
        const limitText = formatLimit(limit);
        const upgradeMsg = user.plan === 'free'
          ? ' Faça upgrade para o Plano Pro para criar até 100 links!'
          : user.plan === 'pro'
            ? ' Faça upgrade para o Plano Business para links ilimitados!'
            : '';

        setFeedback({
          type: 'error',
          msg: `Limite de ${limitText} URLs atingido!${upgradeMsg}`
        });
        setLoading(false);
        return;
      }

      // 🐛 DEBUG: Log dos valores antes de enviar
      console.log('🔍 [UrlCreator] Valores capturados do formulário:');
      console.log('  - original_url:', url);
      console.log('  - slug:', slug);
      console.log('  - user.id:', user.id);
      console.log('  - user.plan:', user.plan);

      await urlService.createUrl({ original_url: url, slug, user });
      setFeedback({ type: 'success', msg: 'Link criado com sucesso! Ele já "vai".' });
      setUrl('');
      setSlug('');
      onCreated();
    } catch (e: any) {
      console.error('🔍 [UrlCreator] Erro ao criar URL:', e);
      setFeedback({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/5 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
          <Zap size={20} fill="currentColor" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Novo Link de Conversão</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Seu cliente não pensa. Ele vai.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Destino do Link (URL Longa)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ex: https://wa.me/551199999..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sua URL Curta</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold select-none">
              12vai/
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                placeholder="slug-personalizado"
                className={`w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border ${validation && !validation.valid ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700'} rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium`}
              />
              {validation?.isPremium && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={10} /> Premium
                </div>
              )}
            </div>
          </div>

          {validation && !validation.valid && (
            <p className="mt-2 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {validation.error}
            </p>
          )}

          {validation?.isPremium && user.plan !== 'business' && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed">
              <strong>Atenção:</strong> Slugs curtos e comerciais como "{slug}" são <strong>Premium</strong>.
              Eles aumentam a confiança do clique em 40%. <button className="underline font-bold">Faça upgrade para Business</button>.
            </div>
          )}
        </div>

        {feedback && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {feedback.msg}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || (slug !== '' && validation && !validation.valid)}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? 'Preparando Link...' : 'Criar Link e "Ir"'}
        </button>
      </div>
    </div>
  );
};

export default UrlCreator;
