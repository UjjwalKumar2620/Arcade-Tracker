// ============================================================
// Arcade Tracker — Frontend TypeScript Types (No Database)
// ============================================================

export interface Participant {
  row_index: number;
  name: string;
  email: string;
  google_skills_profile: string | null;
  google_skills_profile_status: string | null;
  developer_profile: string | null;
  developer_profile_status: string | null;
  access_code: string | null;
  milestone: string | null;
  bonus_milestone: string | null;
  verification_status: string | null;
  gear_status: string | null;
  digital_badge: boolean;
  skill_badges: number;
  skill_badge_names: string | null;
  arcade_games_completed: number;
  completed_game_names: string | null;
  total_points: number;
  completion_percentage: number;
  rank_overall: number;
  rank_skill_badges: number;
  rank_arcade_games: number;
}

export interface DashboardStats {
  total_participants: number;
  total_skill_badges: number;
  total_arcade_games: number;
  gear_badge_completed: number;
  gear_badge_pending: number;
  digital_badge_completed: number;
  digital_badge_pending: number;
  verified_participants: number;
  pending_verification: number;
  milestone_completion: { milestone: string; count: number }[];
  bonus_milestone_completion: { milestone: string; count: number }[];
  access_code_redeemed: number;
  access_code_pending: number;
  avg_skill_badges: number;
  avg_arcade_games: number;
  top_performers: { name: string; skill_badges: number; arcade_games: number; total_points: number; completion: number }[];
  last_refresh_time: string;
  sync_status: 'fresh' | 'cached' | 'error';
  cache_age_seconds: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface AppSettings {
  google_sheet_url: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    from_cache?: boolean;
    cache_age_seconds?: number;
  };
}
