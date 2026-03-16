import { useQuery } from "@tanstack/react-query";
import statsService from "../../api/StatsServices.js";

const DEFAULT_DASHBOARD_DATA = {
  totalStats: {
    userCount: 0,
    problemCount: 0,
    solutionCount: 0
  },
  leaderboards: {
    leaderboardMetrics: [],
    currentUserStats: null
  }
};

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsService.getStats,

    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,

    placeholderData: DEFAULT_DASHBOARD_DATA
  });
}

export { useDashboardStats };