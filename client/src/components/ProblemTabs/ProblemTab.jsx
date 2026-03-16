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

import { useMyProblems } from "../../hooks/Problems/useMyProblems.js";

function ProblemTab() {

  const navigate = useNavigate();
  const [topicFilter, setTopicFilter] = useState("all");

  const { data: apiResponse, isLoading, isError } =
    useMyProblems(topicFilter);

  const myProblems = useMemo(
    () => apiResponse?.data || [],
    [apiResponse]
  );

  const topics = useMemo(
    () =>
      Array.from(
        new Set(myProblems.flatMap((p) => p.topics || []))
      ),
    [myProblems]
  );

  const visitProblem = (problem) => {
    const safeTitle = encodeURIComponent(
      problem.title.replaceAll(" ", "-")
    );
    navigate(`/solve-problem/${safeTitle}/${problem._id}`);
  };

  return (
    <TabsContent value="myproblems">

      <div className="flex justify-between items-center mb-4">

        <h3 className="text-lg font-semibold">
          Your Uploaded Problems
        </h3>

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
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>

          </Select>
        )}

      </div>

      {isError && (
        <p className="text-red-500 text-center">
          Failed to load problems
        </p>
      )}

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">
          Loading problems...
        </p>
      ) : myProblems.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          {topicFilter === "all"
            ? "You haven't uploaded problems yet."
            : "No problems match this topic"}
        </p>
      ) : (
        <div className="space-y-4">

          {myProblems.map((problem, index) => (
            <div
              key={problem._id}
              onClick={() => visitProblem(problem)}
              className="cursor-pointer border rounded-md p-4 hover:bg-muted transition"
            >

              <div className="flex justify-between">
                <h4 className="font-medium">
                  {index + 1}. {problem.title}
                </h4>

                <span className="text-xs text-muted-foreground">
                  {problem.createdAt
                    ? new Date(problem.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>

              <div className="flex gap-2 mt-2 flex-wrap">
                {problem.topics?.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>

              <p className="text-sm mt-2 text-muted-foreground">
                {problem.description?.slice(0, 100)}...
              </p>

              <p className="text-sm mt-2 text-green-700">
                {problem.solutionCount || 0} solutions submitted
              </p>

            </div>
          ))}

        </div>
      )}
    </TabsContent>
  );
}

export default ProblemTab;