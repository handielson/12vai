
import React, { useEffect, useState } from 'react';
import {
  Copy,
  Trash2,
  BarChart2,
  Search,
  Check,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  QrCode,
  Download,
  X,
  Palette,
  Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Url } from '../types';
import { urlService } from '../services/urlService';
import { useAuth } from '../contexts/AuthContext';
import QRCustomizer from './QRCustomizer';
import type { QRConfig } from '../types';

const UrlList: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; url: Url | null }>({
    show: false,
    url: null
  });
  const [deleting, setDeleting] = useState(false);
  const [qrModal, setQrModal] = useState<{ show: boolean; url: Url | null }>({
    show: false,
    url: null
  });
  const [analyticsModal, setAnalyticsModal] = useState<{ show: boolean; url: Url | null }>({
    show: false,
    url: null
  });
  const [qrCustomizerModal, setQrCustomizerModal] = useState<{ show: boolean; url: Url | null }>({
    show: false,
    url: null
  });

  const fetchUrls = async () => {
    if (!supabaseUser) {
      setLoading(false);
      return;
    }

    try {
      const data = await urlService.getMyUrls(supabaseUser.id);
      setUrls(data);
    } catch (error) {
      console.error('Erro ao carregar URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [supabaseUser]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(`https://12vai.com/${url}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteModal.url || !supabaseUser) return;

    setDeleting(true);
    try {
      await urlService.deleteUrl(deleteModal.url.id, supabaseUser.id);
      setDeleteModal({ show: false, url: null });
      fetchUrls(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar URL:', error);
      alert('Erro ao deletar URL. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const downloadQRCode = (slug: string) => {
    const svg = document.getElementById(`qr-${slug}`) as unknown as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-12vai-${slug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const filteredUrls = urls.filter(u =>
    u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.short_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Links Ativos</h1>
          <p className="text-slate-500 font-medium">Todos os caminhos que levam seu cliente ao fechamento.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por slug ou título..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Destino / Título</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">URL Curta (VAI)</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Acessos</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium animate-pulse">Consultando infraestrutura de borda...</td>
                </tr>
              ) : filteredUrls.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="text-slate-400" size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {searchTerm ? 'Nenhum link encontrado' : 'Nenhum link ativo ainda'}
                      </h3>
                      <p className="text-slate-500 mb-6">
                        {searchTerm
                          ? 'Tente buscar por outro termo'
                          : 'Crie seu primeiro link encurtado e faça o seu negócio "ir"!'
                        }
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => window.location.href = '/dashboard'}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                        >
                          <Sparkles size={18} />
                          Criar Primeiro Link
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 mb-0.5">{url.title}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[250px] font-medium">{url.original_url}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <span className="text-sm font-black text-indigo-600">12vai.com/{url.short_slug}</span>
                          {url.is_premium && (
                            <span className="ml-2 p-1 bg-amber-100 text-amber-600 rounded" title="Link Premium">
                              <Sparkles size={12} />
                            </span>
                          )}
                          {url.password && (
                            <span className="ml-2 p-1 bg-amber-100 text-amber-600 rounded" title="Protegido por senha">
                              <Lock size={12} />
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(url.short_slug, url.id)}
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                        >
                          {copiedId === url.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 rounded-full text-xs font-black text-white">
                        {url.clicks_count.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(`${window.location.origin}/${url.short_slug}`, '_blank')}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-100 rounded-xl transition-all shadow-sm"
                          title="Abrir Link"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => setQrModal({ show: true, url })}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white border border-transparent hover:border-emerald-100 rounded-xl transition-all shadow-sm"
                          title="QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        <button
                          onClick={() => setQrCustomizerModal({ show: true, url })}
                          className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-white border border-transparent hover:border-purple-100 rounded-xl transition-all shadow-sm"
                          title="Personalizar QR"
                        >
                          <Palette size={18} />
                        </button>
                        <button
                          onClick={() => setAnalyticsModal({ show: true, url })}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all shadow-sm"
                          title="Dados"
                        >
                          <BarChart2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, url })}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 rounded-xl transition-all shadow-sm"
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteModal.show && deleteModal.url && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-rose-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Confirmar Exclusão</h3>
                <p className="text-sm text-slate-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 mb-2">Você está prestes a deletar:</p>
              <p className="text-lg font-bold text-indigo-600">12vai.com/{deleteModal.url.short_slug}</p>
              <p className="text-xs text-slate-400 mt-1 truncate">{deleteModal.url.original_url}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, url: null })}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Deletar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de QR Code */}
      {qrModal.show && qrModal.url && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <QrCode className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">QR Code</h3>
                  <p className="text-sm text-slate-500">Escaneie para acessar</p>
                </div>
              </div>
              <button
                onClick={() => setQrModal({ show: false, url: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 mb-6 flex justify-center">
              <QRCodeSVG
                id={`qr-${qrModal.url.short_slug}`}
                value={`https://12vai.com/${qrModal.url.short_slug}`}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Informações */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600 mb-1">Link:</p>
              <p className="text-lg font-bold text-indigo-600 break-all">https://12vai.com/{qrModal.url.short_slug}</p>
              <p className="text-xs text-slate-400 mt-2 truncate">{qrModal.url.original_url}</p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setQrModal({ show: false, url: null })}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Fechar
              </button>
              <button
                onClick={() => downloadQRCode(qrModal.url!.short_slug)}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Baixar PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Analytics */}
      {analyticsModal.show && analyticsModal.url && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <BarChart2 className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Analytics do Link</h3>
                  <p className="text-sm text-slate-500">Estatísticas detalhadas</p>
                </div>
              </div>
              <button
                onClick={() => setAnalyticsModal({ show: false, url: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Informações do Link */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Link Encurtado:</p>
                  <p className="text-2xl font-bold text-indigo-600">12vai.com/{analyticsModal.url.short_slug}</p>
                </div>
                {analyticsModal.url.is_premium && (
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold flex items-center gap-2">
                    <Sparkles size={16} />
                    Premium
                  </span>
                )}
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Destino:</p>
                <p className="text-sm text-slate-700 font-medium truncate">{analyticsModal.url.original_url}</p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-slate-900 mb-1">
                  {analyticsModal.url.clicks_count.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Total de Cliques
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-emerald-600 mb-1">
                  {analyticsModal.url.active ? '✓' : '✗'}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Status
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-lg font-black text-slate-900 mb-1">
                  {new Date(analyticsModal.url.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Criado em
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Informações</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Título:</span>
                  <span className="font-medium text-slate-900">{analyticsModal.url.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tipo:</span>
                  <span className="font-medium text-slate-900">
                    {analyticsModal.url.is_premium ? 'Premium' : 'Padrão'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">ID:</span>
                  <span className="font-mono text-xs text-slate-500">{analyticsModal.url.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={() => setAnalyticsModal({ show: false, url: null })}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Personalização de QR Code */}
      {qrCustomizerModal.show && qrCustomizerModal.url && (
        <QRCustomizer
          url={`https://12vai.com/${qrCustomizerModal.url.short_slug}`}
          initialConfig={qrCustomizerModal.url.qr_config || undefined}
          onSave={async (config) => {
            try {
              await urlService.updateQRConfig(qrCustomizerModal.url!.id, config);
              fetchUrls();
              alert('✅ Configuração de QR Code salva com sucesso!');
            } catch (error) {
              console.error('Erro ao salvar configuração:', error);
              alert('❌ Erro ao salvar configuração. Tente novamente.');
            }
          }}
          onClose={() => setQrCustomizerModal({ show: false, url: null })}
        />
      )}
    </div>
  );
};

export default UrlList;
