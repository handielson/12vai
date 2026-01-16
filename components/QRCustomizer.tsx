import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { X, Download, RotateCcw, Upload } from 'lucide-react';
import type { QRConfig } from '../../types';

interface QRCustomizerProps {
    url: string;
    initialConfig?: QRConfig;
    onSave: (config: QRConfig) => void;
    onClose: () => void;
}

const defaultConfig: QRConfig = {
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    dotsStyle: 'rounded',
    cornersStyle: 'extra-rounded',
    margin: 10,
    size: 300
};

export default function QRCustomizer({ url, initialConfig, onSave, onClose }: QRCustomizerProps) {
    const [config, setConfig] = useState<QRConfig>(initialConfig || defaultConfig);
    const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Criar instância do QR Code
        const qr = new QRCodeStyling({
            width: config.size,
            height: config.size,
            data: url,
            image: config.logoUrl,
            margin: config.margin,
            dotsOptions: {
                color: config.foregroundColor,
                type: config.dotsStyle
            },
            backgroundOptions: {
                color: config.backgroundColor
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 5,
                imageSize: config.logoSize || 0.3
            },
            cornersSquareOptions: {
                type: config.cornersStyle,
                color: config.foregroundColor
            },
            cornersDotOptions: {
                type: config.cornersStyle,
                color: config.foregroundColor
            }
        });

        setQrCode(qr);

        // Renderizar no canvas
        if (canvasRef.current) {
            canvasRef.current.innerHTML = '';
            qr.append(canvasRef.current);
        }
    }, [config, url]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamanho (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Logo muito grande! Máximo 2MB.');
            return;
        }

        // Validar formato
        if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
            alert('Formato inválido! Use PNG, JPG ou SVG.');
            return;
        }

        // Converter para base64 (temporário - em produção, fazer upload para Supabase)
        const reader = new FileReader();
        reader.onload = (event) => {
            setConfig(prev => ({ ...prev, logoUrl: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = () => {
        if (!qrCode) return;
        qrCode.download({ name: 'qr-code', extension: 'png' });
    };

    const handleReset = () => {
        setConfig(defaultConfig);
    };

    const handleSave = () => {
        onSave(config);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Personalizar QR Code</h2>
                        <p className="text-sm text-slate-600 mt-1">Customize cores, logo e estilo do seu QR Code</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Preview */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Preview</h3>
                            <div className="bg-slate-50 rounded-xl p-8 flex items-center justify-center border-2 border-dashed border-slate-300">
                                <div ref={canvasRef}></div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Download size={18} />
                                    Download
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    <RotateCcw size={18} />
                                    Resetar
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900">Opções de Personalização</h3>

                            {/* Cores */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">🎨 Cores</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Cor do QR Code</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={config.foregroundColor}
                                                onChange={(e) => setConfig(prev => ({ ...prev, foregroundColor: e.target.value }))}
                                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.foregroundColor}
                                                onChange={(e) => setConfig(prev => ({ ...prev, foregroundColor: e.target.value }))}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Cor de Fundo</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={config.backgroundColor}
                                                onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                                className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.backgroundColor}
                                                onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">🖼️ Logomarca (Opcional)</label>
                                <div className="space-y-2">
                                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer">
                                        <Upload size={18} />
                                        <span className="text-sm">Fazer upload da logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {config.logoUrl && (
                                        <div>
                                            <label className="block text-xs text-slate-600 mb-1">Tamanho da Logo (%)</label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="40"
                                                value={(config.logoSize || 0.3) * 100}
                                                onChange={(e) => setConfig(prev => ({ ...prev, logoSize: parseInt(e.target.value) / 100 }))}
                                                className="w-full"
                                            />
                                            <div className="text-xs text-slate-500 text-center">{Math.round((config.logoSize || 0.3) * 100)}%</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Estilo dos Pontos */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">🔲 Estilo dos Pontos</label>
                                <select
                                    value={config.dotsStyle}
                                    onChange={(e) => setConfig(prev => ({ ...prev, dotsStyle: e.target.value as any }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                >
                                    <option value="dots">Pontos Redondos</option>
                                    <option value="rounded">Quadrados Arredondados</option>
                                    <option value="classy">Clássico</option>
                                    <option value="square">Quadrados</option>
                                </select>
                            </div>

                            {/* Estilo dos Cantos */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">📐 Estilo dos Cantos</label>
                                <select
                                    value={config.cornersStyle}
                                    onChange={(e) => setConfig(prev => ({ ...prev, cornersStyle: e.target.value as any }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                >
                                    <option value="dot">Pontos</option>
                                    <option value="square">Quadrados</option>
                                    <option value="extra-rounded">Extra Arredondado</option>
                                </select>
                            </div>

                            {/* Tamanho */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">📏 Tamanho</label>
                                <input
                                    type="range"
                                    min="200"
                                    max="600"
                                    step="50"
                                    value={config.size}
                                    onChange={(e) => setConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="text-xs text-slate-500 text-center">{config.size}px × {config.size}px</div>
                            </div>

                            {/* Margem */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">⬜ Margem</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={config.margin}
                                    onChange={(e) => setConfig(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="text-xs text-slate-500 text-center">{config.margin}px</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Salvar Configuração
                    </button>
                </div>
            </div>
        </div>
    );
}
