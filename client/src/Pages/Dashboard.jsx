import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SectionCards } from "@/components/card/SectionCard.jsx";
import statsService from "../api/StatsServices.js";
import Leaderboard from "../components/leaderboard/Leaderboard.jsx";
 
const DEFAULT_DASHBOARD_DATA = {
    totalStats: { userCount: 0, problemCount: 0, solutionCount: 0 },
    leaderboards: { leaderboardMetrics: [], currentUserStats: null }
};

export default function Dashboard() {
    const queryClient = useQueryClient();

    // 🟢 3. Read the data we set during Login
    // We look for the exact same key: ["current-user"]
    const userData = queryClient.getQueryData(["current-user"]);
    const username = userData.username

    // 🟢 REACT QUERY: Standard Fetch
    const { 
        data: dashboardData = DEFAULT_DASHBOARD_DATA, 
        isLoading, 
        isError,
        error
    } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: statsService.getStats,
        
        // 🔥 Config Tuning
        staleTime: 60 * 1000,      // 1 min fresh
        retry: 1,                  // Retry once on failure
        refetchOnWindowFocus: false, 
    });

    if (isError) {
        // You can keep the side effect or handle it inline like below
        console.error("Dashboard Fetch Error:", error);
    }

    const formattedName = username ? username.charAt(0).toUpperCase() + username.slice(1) : "Guest";
    const { userCount, problemCount, solutionCount } = dashboardData.totalStats || DEFAULT_DASHBOARD_DATA.totalStats;
    const { leaderboardMetrics, currentUserStats } = dashboardData.leaderboards || DEFAULT_DASHBOARD_DATA.leaderboards;

    const initialPodiumData = leaderboardMetrics?.find(m => m.metric === "Accepted Answers")?.data || {};

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <h1 className="text-2xl font-bold tracking-tight">Welcome, {formattedName} 👋</h1>
                        <p className="text-muted-foreground text-sm mt-1">Here's your progress snapshot.</p>
                    </div>

                    <SectionCards
                        usersCount={userCount}
                        questionCount={problemCount}
                        solutionCount={solutionCount}
                        isLoading={isLoading}
                    />

                    <div className="px-4 lg:px-6">
                        {isLoading ? (
                            <p className="text-center text-blue-500">Loading leaderboard...</p>
                        ) : isError ? (
                            <div className="text-center text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
                                <p>Failed to load dashboard statistics.</p>
                                <button onClick={() => window.location.reload()} className="text-sm underline mt-2">Retry</button>
                            </div>
                        ) : (
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