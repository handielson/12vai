

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, Zap, Lock, Copy, Check, ExternalLink, X } from 'lucide-react';
import { urlService } from '../services/urlService';
import { User } from '../types';
import { canCreateUrl, getUrlLimit, formatLimit, canUsePasswordProtection } from '../lib/planLimits';

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

  // Success modal state
  const [successModal, setSuccessModal] = useState<{ show: boolean; createdSlug: string }>({ show: false, createdSlug: '' });
  const [copied, setCopied] = useState(false);

  // Password protection states
  const [password, setPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [canUsePassword, setCanUsePassword] = useState(false);

  // Verificar permissão de proteção por senha
  useEffect(() => {
    const checkPermission = async () => {
      const allowed = await canUsePasswordProtection(user.plan);
      setCanUsePassword(allowed);
    };
    checkPermission();
  }, [user.plan]);

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

      // Validar senha se habilitada
      if (enablePassword && password.length < 4) {
        setFeedback({ type: 'error', msg: 'A senha deve ter no mínimo 4 caracteres' });
        setLoading(false);
        return;
      }

      // 🐛 DEBUG: Log dos valores antes de enviar
      console.log('🔍 [UrlCreator] Valores capturados do formulário:');
      console.log('  - original_url:', url);
      console.log('  - slug:', slug);
      console.log('  - password:', enablePassword ? '***' : 'none');
      console.log('  - user.id:', user.id);
      console.log('  - user.plan:', user.plan);

      await urlService.createUrl({
        original_url: url,
        slug,
        user,
        password: enablePassword ? password : null,
        password_hint: enablePassword ? passwordHint : null
      });

      // Show success modal instead of inline feedback
      setSuccessModal({ show: true, createdSlug: slug });
      setUrl('');
      setSlug('');
      setPassword('');
      setPasswordHint('');
      setEnablePassword(false);
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

        {/* Password Protection */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          {canUsePassword ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock size={14} />
                  Proteger com senha
                </span>
              </label>

              {enablePassword && (
                <div className="ml-6 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha (mín. 4 caracteres)"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={passwordHint}
                      onChange={(e) => setPasswordHint(e.target.value)}
                      placeholder="Dica da senha (opcional)"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    💡 Visitantes precisarão digitar a senha antes de acessar o link
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              🔒 <strong>Proteção por senha</strong> disponível no Plano Pro.
              <button className="underline font-bold ml-1">Fazer upgrade</button>
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

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Link Criado!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pronto para compartilhar</p>
                </div>
              </div>
              <button
                onClick={() => setSuccessModal({ show: false, createdSlug: '' })}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Created Link */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Seu link:</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 break-all">
                12vai.com/{successModal.createdSlug}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://12vai.com/${successModal.createdSlug}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copiar Link
                  </>
                )}
              </button>

              <button
                onClick={() => window.location.href = '/links'}
                className="w-full px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Ver Meus Links
              </button>

              <button
                onClick={() => setSuccessModal({ show: false, createdSlug: '' })}
                className="w-full px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl font-medium transition-all"
              >
                Criar Outro Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlCreator;
