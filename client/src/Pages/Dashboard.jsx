import { useState, useEffect } from "react";
import { SectionCards } from "@/components/card/SectionCard.jsx"; 
import statsService from "../api/StatsServices.jsx"; 
import LeaderboardComponent from "../components/leaderboard/Leaderboard.jsx";
import { toast } from "sonner"; 
 
const DEFAULT_DASHBOARD_DATA = {
    totalStats: { userCount: 0, problemCount: 0, solutionCount: 0 },
    leaderboards: {
        leaderboardMetrics: [],
        currentUserStats: null,
    }
}; 


export default function Dashboard() {
    const [username] = useState(localStorage.getItem("username") || 'Current_User');
    const [dashboardData, setDashboardData] = useState(DEFAULT_DASHBOARD_DATA);
    const [isLoading, setIsLoading] = useState(true); // Can be set to true if simulating loading

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await statsService.getStats();
            
            // Log the received data for confirmation
            console.log("API Response Data:", data); 

            // Map the API structure to the component state structure
            setDashboardData({
                totalStats: data.totalStats || DEFAULT_DASHBOARD_DATA.totalStats,
                leaderboards: data.leaderboards || DEFAULT_DASHBOARD_DATA.leaderboards,
            });
           
        } catch (error) {
            const userErrorMessage = error.message || "Failed to load dashboard statistics.";

            console.error("Frontend Error:", error);

            toast.error(userErrorMessage, { id: toastId });

        } finally {
            setIsLoading(false);
        }
    }

      useEffect(() => {
        fetchData();
    }, []);

    const formattedName = username
        ? username.charAt(0).toUpperCase() + username.slice(1)
        : "Guest";
 
   const { userCount, problemCount, solutionCount } = dashboardData.totalStats;
    const { leaderboardMetrics, currentUserStats } = dashboardData.leaderboards;
    
    // Determine the initial podium view (e.g., Accepted Answers)
    const initialPodiumData = leaderboardMetrics.find(
        m => m.metric === "Accepted Answers"
    )?.data || {};

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

                    {/* Section for Total Counts */}
                    <SectionCards
                        usersCount={userCount}
                        questionCount={problemCount}
                        solutionCount={solutionCount}
                        isLoading={isLoading}
                    />
                    
                    <div className="px-4 lg:px-6">
                        {isLoading ? (
                            <p className="text-center text-blue-500">Loading leaderboard...</p>
                        ) : (
                            <LeaderboardComponent  
                                // Pass initial podium data, user stats, and all metrics for filtering
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