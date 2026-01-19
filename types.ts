
export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'business';
  custom_url_limit?: number | null; // Admin override
  is_admin?: boolean; // Admin privileges
  created_at: string;
}

export interface Url {
  id: string;
  user_id: string;
  original_url: string;
  short_slug: string;
  prefix: string; // Ex: "vai"
  title: string;
  clicks_count: number;
  is_premium: boolean;
  active: boolean;
  created_at: string;
  qr_config?: QRConfig | null; // Configuração do QR Code
  password?: string | null; // Senha de proteção
  password_hint?: string | null; // Dica da senha (opcional)
}

export interface DashboardStats {
  totalClicks: number;
  totalUrls: number;
  activeUrls: number;
  clicksByDay: { date: string; count: number }[];
  topDevices: { name: string; value: number }[];
  topBrowsers: { name: string; value: number }[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Analytics Types
export interface GeneralStats {
  totalUrls: number;
  totalClicks: number;
  totalUsers: number;
  avgClicksPerUrl: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface TopUrlData {
  shortCode: string;
  originalUrl: string;
  clicks: number;
}

// QR Code Customization Types
export interface QRConfig {
  foregroundColor: string;  // Cor do QR Code
  backgroundColor: string;  // Cor de fundo
  logoUrl?: string;         // URL da logo (opcional)
  logoSize?: number;        // Tamanho da logo (0.1 - 0.4)
  dotsStyle: 'dots' | 'rounded' | 'classy' | 'square';
  cornersStyle: 'dot' | 'square' | 'extra-rounded';
  margin: number;           // Margem (0 - 50)
  size: number;             // Tamanho (200 - 1000)
}
