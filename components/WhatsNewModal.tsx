import React, { useEffect, useState } from 'react';
import { X, Sparkles, Zap, Bug } from 'lucide-react';
import { APP_VERSION } from '../src/version';
import { changelogService, ChangelogEntry } from '../services/changelogService';

export const WhatsNewModal: React.FC = () => {
    const [show, setShow] = useState(false);
    const [changelog, setChangelog] = useState<ChangelogEntry | null>(null);

    useEffect(() => {
        checkVersion();
    }, []);

    const checkVersion = async () => {
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');

        if (lastSeenVersion !== APP_VERSION) {
            // Buscar changelog da versão atual
            const data = await changelogService.getVersionChangelog(APP_VERSION);
            if (data) {
                setChangelog(data);
                setShow(true);
            }
        }
    };

    const handleClose = () => {
        localStorage.setItem('lastSeenVersion', APP_VERSION);
        setShow(false);
    };

    if (!show || !changelog) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                🎉 O que há de novo
                            </h2>
                            <p className="text-indigo-100 mt-1">Versão {changelog.version}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Novidades */}
                    {changelog.changes.new && changelog.changes.new.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <Sparkles className="text-yellow-500" size={20} />
                                Novidades
                            </h3>
                            <ul className="space-y-2">
                                {changelog.changes.new.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-slate-700">
                                        <span className="text-yellow-500 mt-1">✨</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Melhorias */}
                    {changelog.changes.improved && changelog.changes.improved.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <Zap className="text-blue-500" size={20} />
                                Melhorias
                            </h3>
                            <ul className="space-y-2">
                                {changelog.changes.improved.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-slate-700">
                                        <span className="text-blue-500 mt-1">⚡</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Correções */}
                    {changelog.changes.fixed && changelog.changes.fixed.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                                <Bug className="text-green-500" size={20} />
                                Correções
                            </h3>
                            <ul className="space-y-2">
                                {changelog.changes.fixed.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2 text-slate-700">
                                        <span className="text-green-500 mt-1">🐛</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleClose}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Entendi!
                    </button>
                </div>
            </div>
        </div>
    );
};
