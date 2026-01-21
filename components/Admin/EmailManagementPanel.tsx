import React, { useState } from 'react';
import { Mail, Edit, Send } from 'lucide-react';
import { EmailTemplatesManager } from './EmailTemplatesManager';
import { EmailTestPanel } from './EmailTestPanel';

export const EmailManagementPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'templates' | 'test'>('templates');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="text-indigo-600" />
                    Gerenciamento de Emails
                </h2>
                <p className="text-slate-600 mt-1">Edite templates e envie emails de teste</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'templates'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Edit size={18} />
                    Templates
                </button>
                <button
                    onClick={() => setActiveTab('test')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'test'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Send size={18} />
                    Enviar Teste
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'templates' && <EmailTemplatesManager />}
                {activeTab === 'test' && <EmailTestPanel />}
            </div>
        </div>
    );
};

export default EmailManagementPanel;
