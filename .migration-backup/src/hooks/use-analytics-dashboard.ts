import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  fetchUserAnalyticsRows,
  buildDashboardAnalyticsSummary,
} from "@/lib/social/analytics-engine";

export function useAnalyticsDashboard(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["analyticsDashboard", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) return null;
      const analyticsRows = await fetchUserAnalyticsRows(user.id, startDate, endDate);
      return buildDashboardAnalyticsSummary(analyticsRows);
    },
    enabled: !!user?.id,
    refetchInterval: 60_000,
  });

  return {
    ...query,
    data: query.data || null,
  };
}

export default useAnalyticsDashboard;
