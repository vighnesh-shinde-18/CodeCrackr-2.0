import { TabsContent } from "@/components/ui/tabs";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";  
import problemService from "../../api/ProblemServices.jsx";
import { toast } from "sonner";

function ProblemTab() {
    const navigate = useNavigate();
    const [myProblems, setMyProblems] = useState([]);
    const [topicFilter, setTopicFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false);  

    // 1. fetchMyProblems is now dependent on topicFilter
    const fetchMyProblems = async () => {
        setIsLoading(true); // Start loading
        try {
            // Pass the topicFilter to the service function
            const dataArray = await problemService.fetchUserUploadProblem({ topicFilter });
            setMyProblems(dataArray);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to fetch problems");
            console.error("Fetch Error:", err);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    // 2. useEffect now depends on topicFilter.
    // This fetches new data whenever the filter changes.
    useEffect(() => {
        fetchMyProblems();
    }, [topicFilter]); // DEPENDENCY ARRAY CHANGE: [topicFilter]

    // 3. Simplified topic calculation using useMemo for efficiency.
    // This ensures `allTopics` is only recalculated when `myProblems` changes.
    const allTopics = useMemo(() => {
        return Array.from(new Set(myProblems.flatMap((p) => p.topics || [])));
    }, [myProblems]);

    // 4. Local filtering is removed as the API is now expected to handle filtering.
    // We only display the problems returned by the API for the current `topicFilter`.

    const visitProblem =
        (original, problemId) => {
            const titleUrl = original.title.replaceAll(" ","-")
            navigate(`/solve-problem/${titleUrl}/${problemId}`);
        };

    const submittedPlural =
        (count) => (count === 1 ? "" : "s");

    return (
        <TabsContent value="myproblems">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Your Uploaded Problems</h3>
                {/* Use the optimized allTopics list */}
                {allTopics.length > 0 && (
                    <Select value={topicFilter} onValueChange={setTopicFilter} disabled={isLoading}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by Topic" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Topics</SelectItem>
                            {allTopics.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {isLoading ? (
                <p className="text-blue-500">Loading problems...</p>
            ) : myProblems.length === 0 && topicFilter !== "all" ? (
                 // Adjusted condition for no results
                <p className="text-muted-foreground">
                    No problems match the selected topic.
                </p>
            ) : myProblems.length === 0 && topicFilter === "all" ? (
                 <p className="text-muted-foreground">
                    You have not uploaded any problems yet.
                </p>
            ) : (
                <div className="space-y-4">
                    {myProblems.map((problem, index) => (
                        <div
                            key={index}
                            onClick={() => visitProblem(problem,problem.id)}
                            className="cursor-pointer border rounded-md p-4 shadow-sm hover:bg-muted transition-all hover:scale-[1.01]"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-lg">
                                    {index + 1}. {problem.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    {problem.createdAt
                                        ? new Date(problem.createdAt).toLocaleDateString()
                                        : ""}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {problem.topics.map((t, idx) => (
                                    <Badge key={idx} variant="secondary">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm mt-2 text-muted-foreground">
                                {(problem.description?.slice(0, 100) || "No description provided") +
                                    (problem.description?.length > 100 ? "..." : "")}
                            </p>
                            <div className="mt-3 text-sm text-green-700 font-medium">
                                {problem.solutionCount} Solution
                                {submittedPlural(problem.solutionCount)} submitted
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </TabsContent>
    );
}

export default ProblemTab;
