"use client";

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
import { useState, useMemo } from "react";
import problemService from "../../api/ProblemServices";
import { useQuery } from "@tanstack/react-query"; // 🟢 1. Import Hook

function ProblemTab() {
  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState("all");

  // 🟢 2. TANSTACK QUERY REPLACEMENT
  // This replaces: isLoading, myProblems, setMyProblems, useEffect, and fetchMyProblems
  const { 
    data: apiResponse, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ["my-problems", topicFilter], // 🔥 Auto-refetch when topicFilter changes
    queryFn: async () => {
      const response = await problemService.fetchUserUploadProblem({
        topicFilter,
      });
       
      return response;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    keepPreviousData: true,   // Smooth transition when filtering
  });

  // 🟢 3. SAFE DATA EXTRACTION
  // Access the actual array from the response structure
  const myProblems = useMemo(() => {
    const list = apiResponse?.data || [];
    return Array.isArray(list) ? list : [];
  }, [apiResponse]);

  // 🟢 4. TOPIC EXTRACTION (Note: This depends on the fetched list)
  const allTopics = useMemo(() => {
    return Array.from(
      new Set(myProblems.flatMap((p) => p.topics || []))
    );
  }, [myProblems]);

  const visitProblem = (problem) => {
    const safeTitle = encodeURIComponent(problem.title.replaceAll(" ", "-"));
    navigate(`/solve-problem/${safeTitle}/${problem.id || problem._id}`);
  };

  const submittedPlural = (count) => (count === 1 ? "" : "s");

  return (
    <TabsContent value="myproblems">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Your Uploaded Problems</h3>

        {/* FILTER */}
        {/* Only show filter if we have problems or if a filter is active */}
        {(myProblems.length > 0 || topicFilter !== "all") && (
          <Select
            value={topicFilter}
            onValueChange={setTopicFilter}
            disabled={isLoading}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {topicFilter === "all" ? "All Topics" : topicFilter}
              </SelectValue>
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

      {/* ERROR STATE */}
      {isError && (
        <div className="text-red-500 text-center py-8">
            <p>Failed to load your problems.</p>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="text-center py-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
             <p className="mt-2 text-muted-foreground">Loading problems...</p>
        </div>
      ) : myProblems.length === 0 ? (
        // EMPTY STATE
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
             <p className="text-muted-foreground">
                {topicFilter === "all" 
                    ? "You haven't uploaded any problems yet." 
                    : "No problems match this topic."}
             </p>
        </div>
      ) : (
        // LIST STATE
        <div className="space-y-4">
          {myProblems.map((problem, index) => (
            <div
              key={problem.id || problem._id}
              onClick={() => visitProblem(problem)}
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
                {problem.topics?.map((t, idx) => (
                  <Badge key={idx} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>

              <p className="text-sm mt-2 text-muted-foreground">
                {(problem.description?.slice(0, 100) ||
                  "No description provided") +
                  (problem.description?.length > 100 ? "..." : "")}
              </p>

              <div className="mt-3 text-sm text-green-700 font-medium">
                {problem.solutionCount || 0} Solution
                {submittedPlural(problem.solutionCount || 0)} submitted
              </div>
            </div>
          ))}
        </div>
      )}
    </TabsContent>
  );
}

export default ProblemTab;