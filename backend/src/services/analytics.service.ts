// ============================================================
// Arcade Tracker — Analytics Service
// Computes ALL stats in-memory from the participant array.
// No database. Pure computation.
// ============================================================
import type { Participant, DashboardStats, ChartDataPoint } from '../types/index.js';

/**
 * Compute full dashboard stats from a participant array.
 */
export function computeStats(
  participants: Participant[],
  fromCache: boolean,
  cacheAgeSeconds: number,
  fetchedAt: string
): DashboardStats {
  const total = participants.length;

  const totalSkillBadges = participants.reduce((s, p) => s + p.skill_badges, 0);
  const totalArcadeGames = participants.reduce((s, p) => s + p.arcade_games_completed, 0);

  const gearBadgeCompleted = participants.filter(p => p.digital_badge).length;
  const digitalBadgeCompleted = gearBadgeCompleted; // Same metric

  const verified = participants.filter(p => {
    const vs = (p.verification_status || '').toLowerCase();
    return vs === 'verified' || vs === 'completed' || vs === 'approved' || vs === 'yes';
  }).length;

  const accessCodeRedeemed = participants.filter(p =>
    p.access_code?.toLowerCase() === 'yes'
  ).length;

  // Milestone distribution
  const milestoneMap = new Map<string, number>();
  for (const p of participants) {
    const m = p.milestone || 'None';
    milestoneMap.set(m, (milestoneMap.get(m) || 0) + 1);
  }

  // Bonus milestone distribution
  const bonusMilestoneMap = new Map<string, number>();
  for (const p of participants) {
    const bm = p.bonus_milestone || 'None';
    bonusMilestoneMap.set(bm, (bonusMilestoneMap.get(bm) || 0) + 1);
  }

  // Top performers (top 10 by Total Points)
  const topPerformers = [...participants]
    .sort((a, b) =>
      b.total_points - a.total_points ||
      b.arcade_games_completed - a.arcade_games_completed ||
      b.skill_badges - a.skill_badges ||
      a.name.localeCompare(b.name)
    )
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      skill_badges: p.skill_badges,
      arcade_games: p.arcade_games_completed,
      total_points: p.total_points,
      completion: p.completion_percentage,
    }));

  return {
    total_participants: total,
    total_skill_badges: totalSkillBadges,
    total_arcade_games: totalArcadeGames,
    gear_badge_completed: gearBadgeCompleted,
    gear_badge_pending: total - gearBadgeCompleted,
    digital_badge_completed: digitalBadgeCompleted,
    digital_badge_pending: total - digitalBadgeCompleted,
    verified_participants: verified,
    pending_verification: total - verified,
    milestone_completion: Array.from(milestoneMap.entries())
      .map(([milestone, count]) => ({ milestone, count }))
      .sort((a, b) => b.count - a.count),
    bonus_milestone_completion: Array.from(bonusMilestoneMap.entries())
      .map(([milestone, count]) => ({ milestone, count }))
      .sort((a, b) => b.count - a.count),
    access_code_redeemed: accessCodeRedeemed,
    access_code_pending: total - accessCodeRedeemed,
    avg_skill_badges: total > 0 ? Math.round((totalSkillBadges / total) * 100) / 100 : 0,
    avg_arcade_games: total > 0 ? Math.round((totalArcadeGames / total) * 100) / 100 : 0,
    top_performers: topPerformers,
    last_refresh_time: fetchedAt,
    sync_status: fromCache ? 'cached' : 'fresh',
    cache_age_seconds: cacheAgeSeconds,
  };
}

/**
 * Generate chart data from participants.
 */
export function computeChartData(participants: Participant[], chartType: string): ChartDataPoint[] {
  const COLORS = ['#4285F4', '#34A853', '#FBBC04', '#EA4335', '#669DF6', '#5BB974', '#FDD663', '#EE675C'];

  switch (chartType) {
    case 'badge-distribution': {
      const buckets: Record<string, number> = { '0': 0, '1-5': 0, '6-10': 0, '11-15': 0, '16+': 0 };
      for (const p of participants) {
        if (p.skill_badges === 0) buckets['0']++;
        else if (p.skill_badges <= 5) buckets['1-5']++;
        else if (p.skill_badges <= 10) buckets['6-10']++;
        else if (p.skill_badges <= 15) buckets['11-15']++;
        else buckets['16+']++;
      }
      return Object.entries(buckets).map(([label, value], i) => ({
        label: `${label} badges`,
        value,
        color: COLORS[i % COLORS.length],
      }));
    }

    case 'game-completion': {
      const buckets: Record<string, number> = { '0': 0, '1-3': 0, '4-6': 0, '7-8': 0, '9+': 0 };
      for (const p of participants) {
        if (p.arcade_games_completed === 0) buckets['0']++;
        else if (p.arcade_games_completed <= 3) buckets['1-3']++;
        else if (p.arcade_games_completed <= 6) buckets['4-6']++;
        else if (p.arcade_games_completed <= 8) buckets['7-8']++;
        else buckets['9+']++;
      }
      return Object.entries(buckets).map(([label, value], i) => ({
        label: `${label} games`,
        value,
        color: COLORS[i % COLORS.length],
      }));
    }

    case 'milestone-distribution': {
      const map = new Map<string, number>();
      for (const p of participants) {
        const m = p.milestone || 'None';
        map.set(m, (map.get(m) || 0) + 1);
      }
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ label, value, color: COLORS[i % COLORS.length] }));
    }

    case 'gear-completion': {
      const withGear = participants.filter(p => p.digital_badge).length;
      return [
        { label: 'GEAR Completed', value: withGear, color: '#34A853' },
        { label: 'GEAR Pending', value: participants.length - withGear, color: '#EA4335' },
      ];
    }

    case 'verification-status': {
      const verified = participants.filter(p => {
        const vs = (p.verification_status || '').toLowerCase();
        return vs === 'verified' || vs === 'completed' || vs === 'approved' || vs === 'yes';
      }).length;
      return [
        { label: 'Verified', value: verified, color: '#34A853' },
        { label: 'Pending', value: participants.length - verified, color: '#FBBC04' },
      ];
    }

    case 'top-performers': {
      return [...participants]
        .sort((a, b) =>
          b.total_points - a.total_points ||
          b.arcade_games_completed - a.arcade_games_completed ||
          b.skill_badges - a.skill_badges ||
          a.name.localeCompare(b.name)
        )
        .slice(0, 10)
        .map((p, i) => ({
          label: p.name,
          value: p.total_points,
          color: COLORS[i % COLORS.length],
        }));
    }

    default:
      return [];
  }
}
