



import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Zap,
  Menu,
  X,
  CreditCard,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { urlService } from '../services/urlService';
import { getPlanName, getUrlLimit, formatLimit } from '../lib/planLimits';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  userEmail,
  onLogout
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, previewPlan, setPreviewPlan, isPreviewMode } = useAuth();
  const [urlCount, setUrlCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrlCount = async () => {
      if (!user) return;
      try {
        const urls = await urlService.getMyUrls(user.id);
        setUrlCount(urls.length);
      } catch (error) {
        console.error('Erro ao carregar contagem de URLs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUrlCount();
  }, [user, activeTab]); // Recarrega quando mudar de tab

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'links', label: 'Meus Links', icon: LinkIcon },
    { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
    { id: 'billing', label: 'Plano', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="px-4 py-3 bg-amber-500 text-white text-center">
          <div className="text-xs font-bold uppercase tracking-wider">🔍 Modo Preview</div>
          <div className="text-sm font-medium mt-0.5">{getPlanName(user?.plan || 'free')}</div>
        </div>
      )}

      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <Zap size={24} fill="currentColor" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">12Vai</span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
              ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/20'
              : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}

        {/* Admin Portal (apenas para admins REAIS, não em preview) */}
        {user?.is_admin && !isPreviewMode && (
          <>
            <div className="my-2 border-t border-slate-700"></div>
            <a
              href="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-slate-800 hover:text-white text-slate-300"
            >
              <Shield size={20} />
              <span>Portal Admin</span>
              <ExternalLink size={16} className="ml-auto opacity-60" />
            </a>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
          <div className="text-xs font-semibold text-indigo-400 uppercase mb-2">Plano Atual</div>
          <div className="text-sm font-medium text-white mb-1">
            {user ? getPlanName(user.plan) : 'Carregando...'}
          </div>
          {user && (
            <>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((urlCount / getUrlLimit(user.plan, user.custom_url_limit)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-[10px] mt-2 text-slate-400">
                {loading ? 'Carregando...' : `${urlCount} / ${formatLimit(getUrlLimit(user.plan, user.custom_url_limit))} links usados`}
              </p>
              {user.plan === 'free' && (
                <button
                  onClick={() => setActiveTab('billing')}
                  className="mt-3 w-full py-2 bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  Upgrade para Pro
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userEmail || 'Usuário'}</p>
            <p className="text-xs text-slate-500 truncate">
              {user ? getPlanName(user.plan) : 'Carregando...'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:text-rose-400 transition-colors"
        >
          <LogOut size={18} />
          Sair do Painel
        </button>
        <div className="mt-2 text-center text-xs text-slate-600">
          <span className="px-2 py-1 bg-slate-800 rounded font-mono">v1.6.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Overlay do Menu Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <button
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Plan Preview Selector (Admin Only) */}
          {user?.is_admin && (
            <div className="flex items-center gap-3 ml-auto mr-4">
              <span className="text-xs font-medium text-slate-500 hidden sm:block">Ver como:</span>
              <select
                value={previewPlan || 'admin'}
                onChange={(e) => setPreviewPlan(e.target.value === 'admin' ? null : e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              >
                <option value="admin">👑 Admin (Real)</option>
                <option value="free">🆓 Plano Free</option>
                <option value="pro">⚡ Plano Pro</option>
                <option value="business">👔 Plano Business</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-medium"
            >
              <Plus size={18} />
              <span>Criar Novo Link</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
