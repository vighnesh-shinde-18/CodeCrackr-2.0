import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Sub-component: PodiumCard (No React.memo needed here as props change frequently)
function PodiumCard({ place, user, metricLabel, isUserCard = false }) {
    if (!user && !isUserCard) {
        return (
            <div className={`flex flex-col items-center justify-end p-2 transition-all duration-300 ${place === 1 ? 'h-64' : place === 2 ? 'h-56' : 'h-48'} w-full`}>
                <Card className="w-full text-center h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <p className="text-muted-foreground">Empty</p>
                </Card>
            </div>
        );
    }

    const placeDisplay = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place' };
    let rankDisplay = placeDisplay[place];
    if (isUserCard) {
        rankDisplay = `Rank: #${user.currentRank || 'N/A'}`;
    }

    return (
        <div className={`flex flex-col items-center justify-end p-2 transition-all duration-300 w-full`}>
            <Card className={`w-full text-center transition-all duration-300 shadow-xl ${isUserCard ? 'border-2 border-primary' : ''}`}>
                <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-lg text-primary">
                        {isUserCard ? 'You' : rankDisplay}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {isUserCard ? 'Your Profile' : metricLabel}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col items-center">
                    {isUserCard ? (
                        <Avatar className={`h-12 w-12 border-2 ${isUserCard ? 'border-primary' : 'border-gray-300'} shadow-md`}>
                            <AvatarFallback className="text-sm font-bold">
                                {user.username ? user.username.slice(0, 2).toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="h-10 w-10 font-bold text-xl flex items-center justify-center rounded-full">
                            {user.score}
                        </div>
                    )}
                    <p className="mt-3 font-bold text-lg text-black dark:text-white truncate max-w-full">
                        {user.username || 'Current User'}
                    </p>

                    {isUserCard && (
                        <div className="mt-3 grid grid-cols-3 gap-2 w-full text-xs">
                            <Badge className="bg-green-100 text-green-700 justify-center h-auto py-1">{user.totalAcceptedSolutions} Accepted</Badge>
                            <Badge className="bg-blue-100 text-blue-700 justify-center h-auto py-1">{user.totalProblemsPosted} Uploaded</Badge>
                            <Badge className="bg-yellow-100 text-yellow-700 justify-center h-auto py-1">{user.totalSolutionsGiven} Solutions</Badge>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Main Component
export default function LeaderboardComponent({ allMetricsData, currentUserStats }) {
    const [selectedMetric, setSelectedMetric] = useState('Accepted Answers');
    const METRIC_USER_STATS = 'Your Stats';

    // Optimized: Memoize filter options to prevent recalculation on every render
    const allFilterOptions = useMemo(() => {
        return [...allMetricsData.map(m => m.metric), METRIC_USER_STATS];
    }, [allMetricsData]);

    // Optimized: Memoize the specific data lookup
    const currentMetricData = useMemo(() => {
        if (selectedMetric === METRIC_USER_STATS) {
            return {};
        }
        return allMetricsData.find(m => m.metric === selectedMetric)?.data || {};
    }, [allMetricsData, selectedMetric]);

    const { first, second, third } = currentMetricData;
    const metricLabel = selectedMetric === METRIC_USER_STATS ? '' : selectedMetric;

    let podiumContent;

    if (selectedMetric === METRIC_USER_STATS) {
        podiumContent = (
            <div className="flex justify-center w-full">
                <div className="flex justify-center">
                    <PodiumCard place={1} user={currentUserStats} isUserCard={true} metricLabel="Your Stats" />
                </div>
            </div>
        );
    } else {
        podiumContent = (
            <>
                <div className="w-1/3 flex justify-center">
                    <PodiumCard place={2} user={second} metricLabel={metricLabel} />
                </div>
                <div className="w-1/3 flex justify-center">
                    <PodiumCard place={1} user={first} metricLabel={metricLabel} />
                </div>
                <div className="w-1/3 flex justify-center">
                    <PodiumCard place={3} user={third} metricLabel={metricLabel} />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-semibold tracking-tight mb-4">Global Leaderboard</h3>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-56">
                        <SelectValue placeholder="Filter Leaderboard" />
                    </SelectTrigger>
                    <SelectContent>
                        {allFilterOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-center items-end h-72 space-x-4">
                {podiumContent}
            </div>
        </>
    );
}