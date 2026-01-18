import React, { useState } from 'react';
import { FileText, Shield, Scale, ChevronDown, ChevronUp } from 'lucide-react';

type DocumentType = 'terms' | 'privacy';

export const LegalDocumentsPanel: React.FC = () => {
    const [activeDoc, setActiveDoc] = useState<DocumentType>('terms');
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1, 2, 3]));

    const toggleSection = (section: number) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const termsContent = [
        {
            id: 1,
            title: "1. Aceitação dos Termos",
            content: "Ao acessar e usar o VaiEncurta, você aceita e concorda em cumprir estes Termos de Uso e nossa Política de Privacidade."
        },
        {
            id: 2,
            title: "2. Descrição do Serviço",
            content: "O VaiEncurta é uma plataforma SaaS de encurtamento de URLs que oferece criação de links encurtados personalizados, analytics, rastreamento de cliques e planos diferenciados."
        },
        {
            id: 3,
            title: "3. Registro e Conta",
            content: "Você deve fornecer informações precisas, manter a confidencialidade de sua senha e ter pelo menos 18 anos para usar nossos serviços."
        },
        {
            id: 4,
            title: "4. Uso Aceitável",
            content: "Você pode criar links para conteúdo legal e legítimo. É proibido criar links para conteúdo ilegal, fraudulento, malicioso, phishing, spam ou distribuição de malware."
        },
        {
            id: 5,
            title: "5. Planos e Pagamentos",
            content: "Oferecemos planos Free, Pro, Business e White Label. Pagamentos são processados mensalmente ou anualmente. Reembolsos disponíveis em até 7 dias."
        },
        {
            id: 6,
            title: "6. Propriedade Intelectual",
            content: "O VaiEncurta e todo seu conteúdo são propriedade da empresa. Você mantém propriedade dos links que cria."
        },
        {
            id: 7,
            title: "7. Privacidade e Dados",
            content: "Coletamos informações de conta, dados de uso e informações de pagamento. Não vendemos seus dados pessoais."
        },
        {
            id: 8,
            title: "8. Limitações de Responsabilidade",
            content: "Nos esforçamos para manter 99.9% de uptime. Nossa responsabilidade é limitada ao valor pago nos últimos 12 meses."
        },
        {
            id: 9,
            title: "9. Suspensão e Cancelamento",
            content: "Podemos suspender contas por violação dos termos. Você pode cancelar a qualquer momento com efeito no final do período de cobrança."
        },
        {
            id: 10,
            title: "10. Modificações dos Termos",
            content: "Podemos atualizar estes termos a qualquer momento. Notificaremos sobre mudanças significativas."
        }
    ];

    const privacyContent = [
        {
            id: 1,
            title: "1. Informações que Coletamos",
            content: "Coletamos informações de conta (nome, e-mail), dados de uso (URLs, cliques, dispositivos) e informações de pagamento."
        },
        {
            id: 2,
            title: "2. Como Usamos Suas Informações",
            content: "Usamos seus dados para fornecer o serviço, melhorar a plataforma, processar pagamentos e garantir segurança."
        },
        {
            id: 3,
            title: "3. Compartilhamento de Informações",
            content: "Nunca vendemos seus dados. Compartilhamos apenas com processadores de pagamento e provedores de infraestrutura."
        },
        {
            id: 4,
            title: "4. Seus Direitos (LGPD)",
            content: "Você tem direito a acessar, corrigir, excluir, portar seus dados e revogar consentimento conforme a LGPD."
        },
        {
            id: 5,
            title: "5. Segurança de Dados",
            content: "Utilizamos criptografia SSL/TLS, senhas com hash bcrypt, firewall, backups diários e acesso restrito."
        },
        {
            id: 6,
            title: "6. Cookies e Rastreamento",
            content: "Usamos cookies essenciais para autenticação e cookies de analytics (Google Analytics anônimo)."
        },
        {
            id: 7,
            title: "7. Transferência Internacional",
            content: "Dados armazenados em servidores no Brasil e EUA com padrões de segurança SOC 2 e ISO 27001."
        },
        {
            id: 8,
            title: "8. Privacidade de Menores",
            content: "Serviço não destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores."
        },
        {
            id: 9,
            title: "9. Mudanças nesta Política",
            content: "Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas."
        },
        {
            id: 10,
            title: "10. Contato",
            content: "Para questões sobre privacidade: privacidade@12vai.com. Resposta em até 48 horas úteis."
        }
    ];

    const content = activeDoc === 'terms' ? termsContent : privacyContent;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="text-indigo-600" />
                    Documentos Legais
                </h2>
                <p className="text-slate-600 mt-1">Termos de Uso e Política de Privacidade</p>
            </div>

            {/* Document Selector */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveDoc('terms')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${activeDoc === 'terms'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <FileText size={18} />
                    Termos de Uso
                </button>
                <button
                    onClick={() => setActiveDoc('privacy')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${activeDoc === 'privacy'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Shield size={18} />
                    Política de Privacidade
                </button>
            </div>

            {/* Document Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <FileText className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-900">
                        <strong>Última atualização:</strong> 18 de Janeiro de 2026<br />
                        <strong>Versão:</strong> 1.0
                    </div>
                </div>
            </div>

            {/* Document Content */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-200">
                    {content.map((section) => (
                        <div key={section.id} className="border-b border-slate-200 last:border-0">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                            >
                                <h3 className="font-semibold text-slate-900">{section.title}</h3>
                                {expandedSections.has(section.id) ? (
                                    <ChevronUp className="text-slate-400" size={20} />
                                ) : (
                                    <ChevronDown className="text-slate-400" size={20} />
                                )}
                            </button>
                            {expandedSections.has(section.id) && (
                                <div className="px-4 pb-4 text-slate-600 leading-relaxed">
                                    {section.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Download Links */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Documentos Completos</h4>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/docs/TERMS_OF_SERVICE.md"
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                    >
                        <FileText size={16} />
                        Baixar Termos de Uso (MD)
                    </a>
                    <a
                        href="/docs/PRIVACY_POLICY.md"
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                    >
                        <Shield size={16} />
                        Baixar Política de Privacidade (MD)
                    </a>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Dúvidas sobre os Termos?</h4>
                <p className="text-sm text-indigo-700">
                    Entre em contato: <a href="mailto:suporte@12vai.com" className="underline font-medium">suporte@12vai.com</a>
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                    Horário: Segunda a Sexta, 9h às 18h (horário de Brasília)
                </p>
            </div>
        </div>
    );
};
