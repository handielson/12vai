
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
