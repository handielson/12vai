import React, { useState, useEffect } from 'react';
import { Building2, Upload, Image as ImageIcon, Save, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanySettings {
    id: string;
    company_name: string;
    logo_url: string | null;
    favicon_url: string | null;
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

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
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
