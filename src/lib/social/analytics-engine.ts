import { supabase } from "@/lib/supabase";
import type { SocialPlatform } from "../integrations/types";

export interface DashboardAnalyticsPoint {
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface PlatformBreakdown {
  reach: number;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  averageEngagementRate: number;
}

export interface DashboardAnalyticsSummary {
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  engagementRate: number;
  topPlatforms: Record<SocialPlatform, PlatformBreakdown>;
  trend: DashboardAnalyticsPoint[];
  bestPostingTimes: string[];
}

function parseAnalyticsPoint(row: any): DashboardAnalyticsPoint {
  return {
    date: row.date,
    reach: row.reach || 0,
    impressions: row.impressions || 0,
    engagement: row.engagement || 0,
    likes: row.likes || 0,
    comments: row.comments || 0,
    shares: row.shares || 0,
  };
}

export async function fetchAccountAnalyticsRows(
  accountId: string,
  startDate?: string,
  endDate?: string,
) {
  let query = supabase.from("social_analytics").select("*").eq("account_id", accountId);
  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);
  const { data, error } = await query.order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchUserAnalyticsRows(userId: string, startDate?: string, endDate?: string) {
  const { data: accounts, error: accountError } = await supabase
    .from("social_accounts")
    .select("id,platform")
    .eq("user_id", userId);

  if (accountError) throw accountError;

  const accountIds = (accounts || []).map((account: any) => account.id);
  if (accountIds.length === 0) return [];

  let query = supabase.from("social_analytics").select("*").in("account_id", accountIds);

  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  const { data, error } = await query.order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export function buildDashboardAnalyticsSummary(
  analyticsRows: any[],
  platforms: Record<string, SocialPlatform> = {},
): DashboardAnalyticsSummary {
  const trendMap: Record<string, DashboardAnalyticsPoint> = {};
  const platformTotals: Record<SocialPlatform, PlatformBreakdown> = {
    facebook: {
      reach: 0,
      impressions: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      averageEngagementRate: 0,
    },
    instagram: {
      reach: 0,
      impressions: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      averageEngagementRate: 0,
    },
    tiktok: {
      reach: 0,
      impressions: 0,
      engagement: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      averageEngagementRate: 0,
    },
  };

  let totals = {
    reach: 0,
    impressions: 0,
    engagement: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    engagementRate: 0,
    rows: 0,
  };

  analyticsRows.forEach((row) => {
    const platform = row.platform as SocialPlatform;
    const point = parseAnalyticsPoint(row);

    if (!trendMap[point.date]) {
      trendMap[point.date] = { ...point };
    } else {
      trendMap[point.date].reach += point.reach;
      trendMap[point.date].impressions += point.impressions;
      trendMap[point.date].engagement += point.engagement;
      trendMap[point.date].likes += point.likes;
      trendMap[point.date].comments += point.comments;
      trendMap[point.date].shares += point.shares;
    }

    if (platformTotals[platform]) {
      const rowEngagementRate = Number(row.engagement_rate || 0);
      platformTotals[platform].reach += point.reach;
      platformTotals[platform].impressions += point.impressions;
      platformTotals[platform].engagement += point.engagement;
      platformTotals[platform].likes += point.likes;
      platformTotals[platform].comments += point.comments;
      platformTotals[platform].shares += point.shares;
      platformTotals[platform].averageEngagementRate += rowEngagementRate;
    }

    totals.reach += point.reach;
    totals.impressions += point.impressions;
    totals.engagement += point.engagement;
    totals.likes += point.likes;
    totals.comments += point.comments;
    totals.shares += point.shares;
    totals.saves += row.saves || 0;
    totals.engagementRate += Number(row.engagement_rate || 0);
    totals.rows += 1;
  });

  const trend = Object.values(trendMap).sort((a, b) => (a.date > b.date ? 1 : -1));
  const engagementRate =
    totals.rows > 0 ? Number((totals.engagementRate / totals.rows).toFixed(2)) : 0;

  Object.keys(platformTotals).forEach((platformKey) => {
    const platform = platformKey as SocialPlatform;
    const rowsCount = analyticsRows.filter((row) => row.platform === platform).length;
    platformTotals[platform].averageEngagementRate =
      rowsCount > 0
        ? Number((platformTotals[platform].averageEngagementRate / rowsCount).toFixed(2))
        : 0;
  });

  const bestPostingTimes = ["09:00", "12:00", "18:00", "20:00"];

  return {
    totalReach: totals.reach,
    totalImpressions: totals.impressions,
    totalEngagement: totals.engagement,
    totalLikes: totals.likes,
    totalComments: totals.comments,
    totalShares: totals.shares,
    totalSaves: totals.saves,
    engagementRate,
    topPlatforms: platformTotals,
    trend,
    bestPostingTimes,
  };
}

export default {
  fetchAccountAnalyticsRows,
  fetchUserAnalyticsRows,
  buildDashboardAnalyticsSummary,
};
