
import { Url, DashboardStats, User } from '../types';
import { supabase } from '../lib/supabase';

class UrlService {
  private PREFIX = 'vai';

  // Validar slug contra tabelas reserved_slugs e premium_slugs
  async validateSlug(slug: string, userPlan: string): Promise<{ valid: boolean; error?: string; isPremium: boolean }> {
    const s = slug.toLowerCase().trim();

    if (s.length < 3 || s.length > 30) {
      return { valid: false, error: 'O slug deve ter entre 3 e 30 caracteres', isPremium: false };
    }

    if (!/^[a-z0-9-]+$/.test(s)) {
      return { valid: false, error: 'Use apenas letras, números e hífens', isPremium: false };
    }

    // Verificar se é reservado
    const { data: reserved } = await supabase
      .from('reserved_slugs')
      .select('slug')
      .eq('slug', s)
      .single();

    if (reserved) {
      return { valid: false, error: 'Este termo é reservado pelo sistema', isPremium: false };
    }

    // Verificar se é premium
    const { data: premium } = await supabase
      .from('premium_slugs')
      .select('slug')
      .eq('slug', s)
      .single();

    const isPremium = !!premium;

    // Verificar se já está em uso
    const { data: existing } = await supabase
      .from('urls')
      .select('id')
      .eq('short_slug', s)
      .single();

    if (existing) {
      return { valid: false, error: 'Este link já está em uso', isPremium };
    }

    // Validar permissões de plano
    if (isPremium && userPlan !== 'business' && userPlan !== 'white_label') {
      return { valid: false, error: 'Este é um Slug Premium (exige plano Business)', isPremium };
    }

    return { valid: true, isPremium };
  }

  async createUrl(data: {
    original_url: string,
    slug?: string,
    user: User,
    password?: string | null,
    password_hint?: string | null
  }): Promise<Url> {
    const slugRequested = data.slug?.toLowerCase().trim();

    // Se não houver slug, gera um aleatório (padrão Free)
    const finalSlug = slugRequested || Math.random().toString(36).substring(2, 8);

    // Validar slug
    if (slugRequested) {
      if (data.user.plan === 'free') {
        throw new Error("Slugs personalizados exigem plano Pro");
      }

      const validation = await this.validateSlug(slugRequested, data.user.plan);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    // Validar senha se fornecida
    if (data.password && data.password.length < 4) {
      throw new Error("A senha deve ter no mínimo 4 caracteres");
    }

    // Preparar payload para inserção
    const payload = {
      user_id: data.user.id,
      original_url: data.original_url,
      short_slug: finalSlug,
      prefix: this.PREFIX,
      title: data.original_url.split('//')[1]?.split('/')[0] || 'Novo Link',
      is_premium: slugRequested ? (await this.isPremiumSlug(slugRequested)) : false,
      active: true,
      password: data.password || null,
      password_hint: data.password_hint || null,
    };

    // 🐛 DEBUG: Log do payload antes de enviar
    console.log('🔍 [DEBUG] Payload sendo enviado para Supabase:', payload);
    console.log('🔍 [DEBUG] original_url recebido:', data.original_url);

    // Criar URL no banco
    const { data: newUrl, error } = await supabase
      .from('urls')
      .insert(payload)
      .select()
      .single();

    // 🐛 DEBUG: Log da resposta do Supabase
    console.log('🔍 [DEBUG] Resposta do Supabase:', { newUrl, error });

    if (error) throw error;

    return newUrl;
  }

  private async isPremiumSlug(slug: string): Promise<boolean> {
    const { data } = await supabase
      .from('premium_slugs')
      .select('slug')
      .eq('slug', slug.toLowerCase())
      .single();

    return !!data;
  }

  async getMyUrls(userId: string): Promise<Url[]> {
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  async updateUrl(urlId: string, updates: Partial<Url>): Promise<void> {
    const { error } = await supabase
      .from('urls')
      .update(updates)
      .eq('id', urlId);

    if (error) throw error;
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Buscar URLs do usuário
    const urls = await this.getMyUrls(userId);

    // Buscar cliques dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: clicksData } = await supabase
      .from('clicks')
      .select('*, urls!inner(user_id)')
      .eq('urls.user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const clicks = clicksData || [];

    // Agregar cliques por dia
    const clicksByDay = clicks.reduce((acc: any[], click: any) => {
      const date = new Date(click.created_at).toLocaleDateString('pt-BR');
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, []);

    // Agregar por dispositivo
    const deviceCounts = clicks.reduce((acc: any, click: any) => {
      const device = click.device_type || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const topDevices = Object.entries(deviceCounts).map(([name, value]) => ({
      name,
      value: value as number
    }));

    // Agregar por browser
    const browserCounts = clicks.reduce((acc: any, click: any) => {
      const browser = click.browser || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    const topBrowsers = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalClicks: urls.reduce((sum, url) => sum + url.clicks_count, 0),
      totalUrls: urls.length,
      activeUrls: urls.filter(u => u.active).length,
      clicksByDay,
      topDevices,
      topBrowsers,
    };
  }

  // Buscar URL pelo slug (para redirecionamento)
  async getUrlBySlug(slug: string): Promise<Url | null> {
    console.log('🔍 [getUrlBySlug] Buscando slug:', slug);

    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('short_slug', slug)
      .eq('active', true)
      .maybeSingle(); // Usa maybeSingle() em vez de single() para não dar erro se não encontrar

    if (error) {
      console.error('🔍 [getUrlBySlug] Erro ao buscar URL:', error);
      return null;
    }

    if (!data) {
      console.log('🔍 [getUrlBySlug] Nenhuma URL encontrada para slug:', slug);
      return null;
    }

    console.log('🔍 [getUrlBySlug] URL encontrada:', data);
    return data;
  }

  // Deletar URL (apenas do próprio usuário)
  async deleteUrl(urlId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('urls')
      .delete()
      .eq('id', urlId)
      .eq('user_id', userId); // Segurança: só pode deletar suas próprias URLs

    if (error) {
      console.error('Erro ao deletar URL:', error);
      throw error;
    }
  }

  // Atualizar configuração de QR Code
  async updateQRConfig(urlId: string, qrConfig: any): Promise<void> {
    const { error } = await supabase
      .from('urls')
      .update({ qr_config: qrConfig })
      .eq('id', urlId);

    if (error) {
      console.error('Erro ao atualizar configuração de QR:', error);
      throw error;
    }
  }
}

export const urlService = new UrlService();