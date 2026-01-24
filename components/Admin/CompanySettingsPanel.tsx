import React, { useState, useEffect } from 'react';
import { Building2, Upload, Image as ImageIcon, Save, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanySettings {
    id: string;
    company_name: string;
    logo_url: string | null;
    favicon_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    youtube_url: string | null;
    updated_at: string;
}

export const CompanySettingsPanel: React.FC = () => {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companyName, setCompanyName] = useState('12Vai');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [instagramUrl, setInstagramUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setSettings(data);
                setCompanyName(data.company_name || '12Vai');
                setLogoPreview(data.logo_url);
                setFaviconPreview(data.favicon_url);
                setInstagramUrl(data.instagram_url || '');
                setFacebookUrl(data.facebook_url || '');
                setYoutubeUrl(data.youtube_url || '');
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida' });
                return;
            }

            // Validar tamanho (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'A imagem deve ter no máximo 2MB' });
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Por favor, selecione uma imagem válida' });
                return;
            }

            // Validar tamanho (max 500KB para favicon)
            if (file.size > 500 * 1024) {
                setMessage({ type: 'error', text: 'O favicon deve ter no máximo 500KB' });
                return;
            }

            setFaviconFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadFile = async (file: File, folder: 'logos' | 'favicons'): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('company-assets')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('company-assets')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            return null;
        }
    };

    const isValidUrl = (url: string): boolean => {
        if (!url) return true; // Empty is valid (optional field)
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Validate social media URLs
            if (!isValidUrl(instagramUrl)) {
                setMessage({ type: 'error', text: 'URL do Instagram inválida. Use o formato: https://instagram.com/usuario' });
                setSaving(false);
                return;
            }
            if (!isValidUrl(facebookUrl)) {
                setMessage({ type: 'error', text: 'URL do Facebook inválida. Use o formato: https://facebook.com/pagina' });
                setSaving(false);
                return;
            }
            if (!isValidUrl(youtubeUrl)) {
                setMessage({ type: 'error', text: 'URL do YouTube inválida. Use o formato: https://youtube.com/@canal' });
                setSaving(false);
                return;
            }

            let logoUrl = settings?.logo_url || null;
            let faviconUrl = settings?.favicon_url || null;

            // Upload da logo se houver
            if (logoFile) {
                const uploadedLogoUrl = await uploadFile(logoFile, 'logos');
                if (uploadedLogoUrl) {
                    logoUrl = uploadedLogoUrl;
                } else {
                    throw new Error('Falha ao fazer upload da logo');
                }
            }

            // Upload do favicon se houver
            if (faviconFile) {
                const uploadedFaviconUrl = await uploadFile(faviconFile, 'favicons');
                if (uploadedFaviconUrl) {
                    faviconUrl = uploadedFaviconUrl;
                } else {
                    throw new Error('Falha ao fazer upload do favicon');
                }
            }

            // Salvar no banco de dados
            const settingsData = {
                company_name: companyName,
                logo_url: logoUrl,
                favicon_url: faviconUrl,
                instagram_url: instagramUrl || null,
                facebook_url: facebookUrl || null,
                youtube_url: youtubeUrl || null,
                updated_at: new Date().toISOString()
            };

            if (settings) {
                // Atualizar
                const { error } = await supabase
                    .from('company_settings')
                    .update(settingsData)
                    .eq('id', settings.id);

                if (error) throw error;
            } else {
                // Criar
                const { error } = await supabase
                    .from('company_settings')
                    .insert([settingsData]);

                if (error) throw error;
            }

            setMessage({ type: 'success', text: '✅ Configurações salvas com sucesso!' });
            setLogoFile(null);
            setFaviconFile(null);
            loadSettings();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            setMessage({ type: 'error', text: '❌ Erro ao salvar configurações. Verifique o console.' });
        } finally {
            setSaving(false);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(settings?.logo_url || null);
    };

    const removeFavicon = () => {
        setFaviconFile(null);
        setFaviconPreview(settings?.favicon_url || null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando configurações...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="text-indigo-600" />
                    Dados da Empresa
                </h2>
                <p className="text-slate-600 mt-1">Configure a identidade visual da sua empresa</p>
            </div>

            {/* Message */}
            {message && (
                <div className={`rounded-lg p-4 flex items-start gap-3 ${message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <Check className="text-green-600 flex-shrink-0" size={20} />
                    ) : (
                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    )}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-900' : 'text-red-900'
                        }`}>
                        {message.text}
                    </p>
                </div>
            )}

            {/* Company Name */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Nome da Empresa</h3>
                <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nome da empresa..."
                />
            </div>

            {/* Logo Upload */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Logomarca</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Faça upload da logo da sua empresa. Recomendado: PNG ou SVG com fundo transparente, máximo 2MB.
                </p>

                <div className="flex items-start gap-6">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                        <div className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon size={48} className="mx-auto mb-2" />
                                    <p className="text-sm">Sem logo</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3">
                        <label className="block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                                id="logo-upload"
                            />
                            <label
                                htmlFor="logo-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer font-medium"
                            >
                                <Upload size={20} />
                                Escolher Logo
                            </label>
                        </label>

                        {logoFile && (
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-slate-600">
                                    Arquivo selecionado: <strong>{logoFile.name}</strong>
                                </p>
                                <button
                                    onClick={removeLogo}
                                    className="text-red-600 hover:text-red-700"
                                    title="Remover"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        <div className="text-xs text-slate-500 space-y-1">
                            <p>• Formatos aceitos: PNG, JPG, SVG, WebP</p>
                            <p>• Tamanho máximo: 2MB</p>
                            <p>• Dimensões recomendadas: 500x500px</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Favicon Upload */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Favicon</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Faça upload do favicon (ícone que aparece na aba do navegador). Recomendado: 32x32px ou 64x64px, máximo 500KB.
                </p>

                <div className="flex items-start gap-6">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                            {faviconPreview ? (
                                <img
                                    src={faviconPreview}
                                    alt="Favicon preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon size={32} className="mx-auto mb-2" />
                                    <p className="text-xs">Sem favicon</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3">
                        <label className="block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFaviconChange}
                                className="hidden"
                                id="favicon-upload"
                            />
                            <label
                                htmlFor="favicon-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer font-medium"
                            >
                                <Upload size={20} />
                                Escolher Favicon
                            </label>
                        </label>

                        {faviconFile && (
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-slate-600">
                                    Arquivo selecionado: <strong>{faviconFile.name}</strong>
                                </p>
                                <button
                                    onClick={removeFavicon}
                                    className="text-red-600 hover:text-red-700"
                                    title="Remover"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        <div className="text-xs text-slate-500 space-y-1">
                            <p>• Formatos aceitos: PNG, ICO, SVG</p>
                            <p>• Tamanho máximo: 500KB</p>
                            <p>• Dimensões recomendadas: 32x32px ou 64x64px</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Media Links */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Redes Sociais</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Configure os links das redes sociais da sua empresa. Estes links serão utilizados para SEO e podem ser exibidos no site.
                </p>

                <div className="space-y-4">
                    {/* Instagram */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Instagram
                            </div>
                        </label>
                        <input
                            type="url"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://instagram.com/12vai"
                        />
                    </div>

                    {/* Facebook */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </div>
                        </label>
                        <input
                            type="url"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://facebook.com/12vai"
                        />
                    </div>

                    {/* YouTube */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                YouTube
                            </div>
                        </label>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="https://youtube.com/@12vai"
                        />
                    </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                    <p>💡 Dica: Deixe em branco os campos das redes sociais que você não utiliza.</p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Salvar Configurações
                        </>
                    )}
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-900">
                        <strong>Importante:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>As imagens serão armazenadas no Supabase Storage</li>
                            <li>Após salvar, as alterações serão aplicadas em toda a plataforma</li>
                            <li>Recomendamos usar imagens otimizadas para web</li>
                            <li>O favicon pode demorar alguns minutos para atualizar no navegador (cache)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanySettingsPanel;
