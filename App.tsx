

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UrlList from './components/UrlList';
import UrlCreator from './components/UrlCreator';
import Reports from './components/Reports';
import { BillingPanel } from './components/BillingPanel';
import Settings from './components/Settings';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminPortal from './components/Admin/AdminPortal';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ForgotPassword from './components/Auth/ForgotPassword';
import RedirectHandler from './components/RedirectHandler';
import { WhatsNewModal } from './components/WhatsNewModal';
import { TermsAcceptanceModal } from './components/TermsAcceptanceModal';
import MaintenancePage from './components/MaintenancePage';
import ContactPage from './components/ContactPage';
import { useAuth } from './contexts/AuthContext';
import { termsService } from './services/termsService';
import { planSettingsService, PlanSettings } from './services/planSettingsService';
import { Zap, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';


const App: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [planSettings, setPlanSettings] = useState<PlanSettings[]>([]);

  // Sincronizar activeTab com a URL atual
  useEffect(() => {
    const currentPath = window.location.pathname.slice(1);
    const INTERNAL_ROUTES = ['dashboard', 'links', 'analytics', 'billing', 'settings'];

    if (INTERNAL_ROUTES.includes(currentPath)) {
      setActiveTab(currentPath);
    } else if (currentPath === '' || currentPath === '/') {
      setActiveTab('dashboard');
    }
  }, []);

  // Atualizar título da página dinamicamente
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: '12vai.com - Painel',
      links: '12vai.com - Meus Links',
      analytics: '12vai.com - Relatórios',
      billing: '12vai.com - Plano',
      settings: '12vai.com - Configurações',
      admin: '12vai.com - Admin Panel'
    };
    document.title = titles[activeTab] || '12vai.com';
  }, [activeTab]);

  // Verificar modo de manutenção
  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  // Verificar se é admin
  useEffect(() => {
    if (user) {
      checkIfAdmin();
    }
  }, [user]);

  // Carregar configurações de planos
  useEffect(() => {
    const loadPlanSettings = async () => {
      try {
        const plans = await planSettingsService.getAllPlanSettings();
        console.log('📊 Planos carregados:', plans);
        setPlanSettings(plans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    };
    loadPlanSettings();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();

      if (data) {
        setMaintenanceMode(data.value.enabled);
      }
    } catch (error) {
      console.error('Erro ao verificar manutenção:', error);
    } finally {
      setCheckingMaintenance(false);
    }
  };

  const checkIfAdmin = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user!.id)
        .maybeSingle();

      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    }
  };

  // Verificar se usuário precisa aceitar termos
  useEffect(() => {
    const checkTermsAcceptance = async () => {
      if (!user) return;

      try {
        const status = await termsService.checkUserAcceptance(user.id);
        setShowTermsModal(status.needs_acceptance);
      } catch (error) {
        console.error('Erro ao verificar aceite de termos:', error);
      }
    };

    if (user) {
      checkTermsAcceptance();
    }
  }, [user]);

  // ============================================
  // VERIFICAÇÃO DE ROTA ADMIN (PRIMEIRA PRIORIDADE)
  // Deve acontecer ANTES de qualquer outra verificação
  // ============================================
  const currentPath = window.location.pathname.slice(1);
  const isAdminRoute = currentPath === 'admin' || currentPath.startsWith('admin/');

  // Extrair a aba da URL (ex: /admin/cupons -> 'cupons')
  const adminTab = currentPath.startsWith('admin/')
    ? currentPath.split('/')[1]
    : undefined;

  // Se for rota admin, renderizar AdminPortal IMEDIATAMENTE
  // Não passa por verificação de manutenção nem loading
  if (isAdminRoute) {
    return <AdminPortal initialTab={adminTab} />;
  }

  // ============================================
  // VERIFICAÇÃO DE SLUG (SEGUNDA PRIORIDADE)
  // ============================================
  // Define all internal routes that should NOT be treated as slugs
  const INTERNAL_ROUTES = [
    'dashboard',
    'links',
    'analytics',
    'billing',
    'settings',
    'admin',
    'contato',
    'login',
    'register',
    'forgot',
    'forgot-password'
  ];

  // Verificar se é um arquivo estático (tem extensão)
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(currentPath);

  const isSlugRoute = currentPath &&
    currentPath !== '' &&
    !INTERNAL_ROUTES.includes(currentPath.toLowerCase()) &&
    !hasFileExtension; // Excluir arquivos estáticos

  // Se for uma rota de slug, mostrar o RedirectHandler
  if (isSlugRoute) {
    return <RedirectHandler slug={currentPath} />;
  }

  // ============================================
  // ROTA DE CONTATO (PÚBLICA)
  // ============================================
  if (currentPath === 'contato') {
    return <ContactPage />;
  }

  // ============================================
  // LOADING E MAINTENANCE (APENAS PARA APP PRINCIPAL)
  // ============================================
  if (loading || checkingMaintenance) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="text-indigo-600 mx-auto mb-4 animate-pulse" fill="currentColor" size={48} />
          <p className="text-slate-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar página de manutenção se ativo e não for admin
  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <nav className="p-6 flex items-center justify-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600" fill="currentColor" size={32} />
            <span className="text-2xl font-black text-slate-900 tracking-tight">12Vai</span>
          </div>
        </nav>

        {/* Unified Auth View */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setAuthView('login')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all ${authView === 'login'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setAuthView('register')}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all ${authView === 'register'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Auth Forms */}
            {authView === 'login' && (
              <LoginForm
                onSwitchToRegister={() => setAuthView('register')}
                onSwitchToForgot={() => setAuthView('forgot')}
              />
            )}

            {authView === 'register' && (
              <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
            )}

            {authView === 'forgot' && (
              <ForgotPassword onBack={() => setAuthView('login')} />
            )}
          </div>
        </div>

        {authView === 'login' && (
          <div className="flex-1">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full text-sm font-bold text-indigo-700 mb-8 animate-pulse">
                ⚡ Mais de 10.000 links encurtados
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                Transforme Links em
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Vendas Reais
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                O encurtador brasileiro que <strong>aumenta suas conversões</strong> com links profissionais, analytics poderoso e QR Codes personalizados.
              </p>

              {/* CTA Principal */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={() => setAuthView('register')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                  <Sparkles size={24} />
                  Começar Grátis Agora
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all"
                >
                  Já tenho conta
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white" />
                    ))}
                  </div>
                  <span>+500 usuários ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  ⭐⭐⭐⭐⭐ <span>4.9/5 de satisfação</span>
                </div>
                <div className="flex items-center gap-2">
                  ✅ <span>Sem cartão de crédito</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="bg-gradient-to-b from-slate-50 to-white py-20">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-slate-900 mb-4">
                    Tudo que você precisa para <span className="text-indigo-600">vender mais</span>
                  </h2>
                  <p className="text-xl text-slate-600">
                    Recursos profissionais que fazem a diferença
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: "🎯",
                      title: "Links Personalizados",
                      desc: "Crie links memoráveis como 12vai.com/oferta que seus clientes confiam e clicam mais"
                    },
                    {
                      icon: "📊",
                      title: "Analytics em Tempo Real",
                      desc: "Saiba exatamente quantos cliques, de onde vieram e qual campanha converte melhor"
                    },
                    {
                      icon: "📱",
                      title: "QR Codes Personalizados",
                      desc: "Gere QR Codes com sua marca, cores e logo para materiais físicos e digitais"
                    },
                    {
                      icon: "🔒",
                      title: "Links Protegidos",
                      desc: "Adicione senha aos seus links para conteúdo exclusivo e lançamentos VIP"
                    },
                    {
                      icon: "⚡",
                      title: "Redirecionamento Rápido",
                      desc: "Infraestrutura de alta performance que carrega em menos de 100ms"
                    },
                    {
                      icon: "🎨",
                      title: "Bio Link Profissional",
                      desc: "Centralize todos seus links em uma página bonita para Instagram e TikTok"
                    }
                  ].map((feature, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all group">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8 text-center text-white">
                  {[
                    { number: "10K+", label: "Links Criados" },
                    { number: "500+", label: "Usuários Ativos" },
                    { number: "99.9%", label: "Uptime" },
                    { number: "<100ms", label: "Velocidade" }
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="text-5xl font-black mb-2">{stat.number}</div>
                      <div className="text-indigo-100 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-slate-900 mb-4">
                    Quem usa <span className="text-indigo-600">recomenda</span>
                  </h2>
                  <p className="text-xl text-slate-600">
                    Veja o que nossos clientes dizem
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      name: "Maria Silva",
                      role: "Afiliada Digital",
                      text: "Meus cliques aumentaram 40% depois que comecei a usar links personalizados. O analytics me ajuda a saber exatamente qual campanha funciona!",
                      rating: 5
                    },
                    {
                      name: "João Santos",
                      role: "E-commerce",
                      text: "O QR Code personalizado ficou perfeito nas embalagens. Agora consigo rastrear quantos clientes escaneiam e compram novamente.",
                      rating: 5
                    },
                    {
                      name: "Ana Costa",
                      role: "Influenciadora",
                      text: "Uso o 12Vai para todos meus links do Instagram. É rápido, profissional e meus seguidores confiam mais nos links curtos.",
                      rating: 5
                    }
                  ].map((testimonial, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, j) => (
                          <span key={j} className="text-yellow-400 text-xl">⭐</span>
                        ))}
                      </div>
                      <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                        <div>
                          <div className="font-bold text-slate-900">{testimonial.name}</div>
                          <div className="text-sm text-slate-500">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="py-20 bg-slate-50">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-slate-900 mb-4">
                    Planos que <span className="text-indigo-600">cabem no seu bolso</span>
                  </h2>
                  <p className="text-xl text-slate-600">
                    Comece grátis, evolua quando quiser
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {planSettings.length > 0 ? planSettings.map((plan, i) => {
                    const isPro = plan.plan_name === 'pro';
                    const planDisplayNames: Record<string, string> = {
                      'free': 'Free',
                      'pro': 'Pro',
                      'business': 'Business'
                    };

                    return (
                      <div key={i} className={`bg-white p-8 rounded-2xl border-2 ${isPro ? 'border-indigo-600 shadow-2xl scale-105' : 'border-slate-200'} relative`}>
                        {isPro && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Mais Popular
                          </div>
                        )}
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{planDisplayNames[plan.plan_name] || plan.plan_name}</h3>
                        <div className="mb-6">
                          <span className="text-5xl font-black text-slate-900">
                            R$ {plan.monthly_price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-slate-500">/mês</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                          {/* Limite de URLs como primeiro item */}
                          <li className="flex items-center gap-2 text-slate-600">
                            <span className="text-green-500">✓</span>
                            {plan.url_limit === null ? 'Links ilimitados' : `${plan.url_limit.toLocaleString('pt-BR')} links`}
                          </li>
                          {/* Proteção por senha (se habilitado) */}
                          {plan.allow_password_protection && (
                            <li className="flex items-center gap-2 text-slate-600">
                              <span className="text-green-500">✓</span> Proteção por senha
                            </li>
                          )}
                          {/* Demais features */}
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center gap-2 text-slate-600">
                              <span className="text-green-500">✓</span> {feature}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => setAuthView('register')}
                          className={`w-full py-3 rounded-xl font-bold transition-all ${isPro
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {plan.monthly_price === 0 ? 'Começar Grátis' : `Assinar ${planDisplayNames[plan.plan_name]}`}
                        </button>
                      </div>
                    );
                  }) : (
                    // Fallback enquanto carrega
                    [
                      { name: "Free", price: "R$ 0,00", features: ["100 links", "Analytics básico", "QR Codes simples"] },
                      { name: "Pro", price: "R$ 29,90", features: ["1.000 links", "Analytics avançado", "QR Codes personalizados"], popular: true },
                      { name: "Business", price: "R$ 99,90", features: ["Links ilimitados", "Analytics completo", "API acesso"] }
                    ].map((plan, i) => (
                      <div key={i} className={`bg-white p-8 rounded-2xl border-2 ${plan.popular ? 'border-indigo-600 shadow-2xl scale-105' : 'border-slate-200'} relative`}>
                        {plan.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Mais Popular
                          </div>
                        )}
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                        <div className="mb-6">
                          <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                          <span className="text-slate-500">/mês</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center gap-2 text-slate-600">
                              <span className="text-green-500">✓</span> {feature}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => setAuthView('register')}
                          className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {plan.price === "R$ 0,00" ? 'Começar Grátis' : `Assinar ${plan.name}`}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="py-20 bg-white">
              <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-slate-900 mb-4">
                    Perguntas <span className="text-indigo-600">Frequentes</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: "Preciso de cartão de crédito para começar?",
                      a: "Não! O plano Free é 100% gratuito e não requer cartão de crédito. Você pode criar até 100 links sem pagar nada."
                    },
                    {
                      q: "Posso cancelar a qualquer momento?",
                      a: "Sim! Não há fidelidade. Você pode cancelar seu plano quando quiser e continuar usando o plano Free."
                    },
                    {
                      q: "Os links param de funcionar se eu cancelar?",
                      a: "Não! Seus links continuam funcionando mesmo se você cancelar. Você só perde acesso aos recursos premium."
                    },
                    {
                      q: "Vocês têm suporte em português?",
                      a: "Sim! Somos 100% brasileiros e todo nosso suporte é em português."
                    }
                  ].map((faq, i) => (
                    <details key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-200 group">
                      <summary className="font-bold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                        {faq.q}
                        <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-4 text-slate-600 leading-relaxed">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Pronto para transformar seus links em vendas?
                </h2>
                <p className="text-xl text-indigo-100 mb-8">
                  Junte-se a centenas de empreendedores que já aumentaram suas conversões
                </p>
                <button
                  onClick={() => setAuthView('register')}
                  className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
                >
                  <Sparkles size={24} />
                  Criar Minha Conta Grátis
                </button>
                <p className="text-indigo-100 mt-4 text-sm">
                  ✓ Sem cartão de crédito  ✓ Cancele quando quiser  ✓ Suporte em português
                </p>
              </div>
            </div>
          </div>
        )}

        <footer className="p-10 border-t border-slate-200 text-center text-slate-400 font-medium">
          <div className="flex items-center justify-center gap-3">
            <span>&copy; 2026 12Vai. Encurtador de URLs Brasileiro.</span>
            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
              v1.11.0
            </span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userEmail={user?.email}
      onLogout={signOut}
    >
      {activeTab === 'dashboard' && (
        <>
          <UrlCreator user={user!} onCreated={() => { }} />
          <Dashboard />
        </>
      )}
      {activeTab === 'links' && <UrlList />}
      {activeTab === 'analytics' && <Reports />}
      {activeTab === 'billing' && <BillingPanel />}
      {activeTab === 'settings' && <Settings />}

      {/* Modal de atualizações */}
      <WhatsNewModal />

      {/* Modal de aceite de termos */}
      {showTermsModal && user && (
        <TermsAcceptanceModal
          userId={user.id}
          onAccepted={() => setShowTermsModal(false)}
        />
      )}
    </Layout>
  );
};

export default App;
