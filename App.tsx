

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UrlList from './components/UrlList';
import UrlCreator from './components/UrlCreator';
import Reports from './components/Reports';
import Billing from './components/Billing';
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
import { useAuth } from './contexts/AuthContext';
import { termsService } from './services/termsService';
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

  const checkMaintenanceMode = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

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
        .single();

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
        <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600" fill="currentColor" size={32} />
            <span className="text-2xl font-black text-slate-900 tracking-tight">12Vai</span>
          </div>
          <div className="flex items-center gap-6">
            {authView !== 'login' && (
              <button
                onClick={() => setAuthView('login')}
                className="px-6 py-3 text-slate-700 hover:text-slate-900 font-bold text-sm transition-all"
              >
                Entrar
              </button>
            )}
            {authView !== 'register' && (
              <button
                onClick={() => setAuthView('register')}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                Começar Grátis
              </button>
            )}
          </div>
        </nav>

        {authView === 'login' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <LoginForm
              onSwitchToRegister={() => setAuthView('register')}
              onSwitchToForgot={() => setAuthView('forgot')}
            />
          </div>
        )}

        {authView === 'register' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
          </div>
        )}

        {authView === 'forgot' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <ForgotPassword onBack={() => setAuthView('login')} />
          </div>
        )}

        {authView === 'login' && (
          <div className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 border border-indigo-100 shadow-sm">
              🚀 Sua marca não explica. Ela vai.
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter">
              Seu cliente não pensa. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 italic">Ele vai.</span>
            </h1>

            <p className="text-2xl text-slate-500 max-w-3xl mb-14 font-medium leading-relaxed">
              Links curtos que convertem. Use o prefixo que dá movimento ao seu negócio. Venda mais no WhatsApp, Instagram e anúncios.
            </p>

            <div className="w-full max-w-4xl bg-white p-3 rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 mb-20">
              <div className="flex-1 flex items-center px-6 gap-4 border-r border-slate-100">
                <div className="text-slate-400 font-bold">12vai/</div>
                <input
                  type="text"
                  placeholder="link-que-vende"
                  className="w-full py-5 bg-transparent outline-none text-slate-900 font-bold text-xl placeholder:text-slate-300"
                />
              </div>
              <button
                onClick={() => setAuthView('register')}
                className="px-12 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
              >
                Encurtar Agora <Sparkles size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {[
                { title: "Slugs Premium", desc: "Garanta termos como /pix ou /oferta e aumente sua credibilidade." },
                { title: "Redirecionamento Instantâneo", desc: "Infraestrutura de borda que carrega antes do cliente piscar." },
                { title: "Analytics de Venda", desc: "Saiba exatamente qual anúncio trouxe o cliente que comprou." }
              ].map((f, i) => (
                <div key={i} className="text-left p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="p-10 border-t border-slate-200 text-center text-slate-400 font-medium">
          <div className="flex items-center justify-center gap-3">
            <span>&copy; 2026 12Vai. Encurtador de URLs Brasileiro.</span>
            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
              v1.5.0
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
      {activeTab === 'billing' && <Billing />}
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
