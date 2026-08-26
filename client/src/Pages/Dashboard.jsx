import { useCurrentUser } from "../hooks/Security/useCurrentUser.js";
import { useDashboardStats } from "../hooks/Dashboard/useDashboardStats.js";
import { SectionCards } from "@/components/card/SectionCard.jsx";
import Leaderboard from "../components/leaderboard/Leaderboard.jsx";

export default function Dashboard() {

  const { data: user } = useCurrentUser();

  const {
    data: dashboardData,
    isLoading,
    isError,
    error
  } = useDashboardStats();

  const formattedName = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : "Guest";

  const { userCount, problemCount, solutionCount } =
    dashboardData.totalStats;

  const { leaderboardMetrics, currentUserStats } =
    dashboardData.leaderboards;

  const initialPodiumData =
    leaderboardMetrics?.find(m => m.metric === "Accepted Answers")?.data || {};

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {formattedName} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here's your progress snapshot.
            </p>
          </div>

          <SectionCards
            usersCount={userCount}
            questionCount={problemCount}
            solutionCount={solutionCount}
            isLoading={isLoading}
          />

          <div className="px-4 lg:px-6">

            {isLoading && (
              <p className="text-center text-blue-500">
                Loading leaderboard...
              </p>
            )}

            {isError && (
              <div className="text-center text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
                <p>Failed to load dashboard statistics.</p>
              </div>
            )}

            {!isLoading && !isError && (
              <Leaderboard
                podiumData={initialPodiumData}
                currentUserStats={currentUserStats}
                allMetricsData={leaderboardMetrics}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}