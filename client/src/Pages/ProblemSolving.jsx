"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";

// Services
import problemService from "../api/ProblemServices.js";
import solutionService from "../api/SolutionServices.js";
import authService from "../api/AuthServices.js"; // 🟢 Import Auth Service

// Components
import ProblemDetails from "../components/Problem/ProblemDetails.jsx";
import SolutionReplies from "../components/Solution/SolutionReplies.jsx";
import SolutionInput from "../components/Solution/SolutionInput.jsx";

// 🟢 Import React Query
import { useQuery } from "@tanstack/react-query";

export default function ProblemSolving() {
  const { id } = useParams();
  
  // UI State
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [showEditor, setShowEditor] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // 🟢 QUERY 0: Fetch Current User (Replaces localStorage)
  const { data: currentUserResponse } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 60, // Keep fresh for 1 hour (User data rarely changes)
    retry: 1,
  });

  const currentUserEmail = currentUserResponse?.email;

  // 🟢 QUERY 1: Fetch Problem Details
  const { 
    data: problem, 
    isLoading: isProblemLoading, 
    error: problemError,
    refetch: refetchProblem 
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemService.fecthProblemDetails(id),
    enabled: !!id, 
    staleTime: 60 * 1000 * 5, 
  });

  // 🟢 QUERY 2: Fetch Solutions
  const { 
    data: allSolutionsResponse, 
    isLoading: isSolutionsLoading,
    refetch: refetchSolutions
  } = useQuery({
    queryKey: ["solutions", id, filterStatus], 
    queryFn: async () => {
        let params = {};
        if (filterStatus === "accepted") params.accepted = "true";
        else if (filterStatus === "not_accepted") params.accepted = "false";
        else if (filterStatus === "mine") params.submittedByMe = "true";
        
        const data = await solutionService.fetchAllSolutions(id, params);
        return data; 
    },
    enabled: !!id,
    keepPreviousData: true, 
  });

  // Handle View Logic
  const handleViewSolution = (solution) => {
    setSelectedSolution(solution);
    setShowEditor(false);
  };

  const handleResetEditor = () => {
    setSelectedSolution(null);
    setShowEditor(true);
  };

  if (isProblemLoading) return <div className="p-10 text-center">Loading problem...</div>;
  if (problemError) return <div className="p-10 text-center text-red-500">Error loading problem.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <ProblemDetails 
            problem={problem?.data} 
            loadProblem={refetchProblem} 
          />
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Other User Replies</h3>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border px-2 py-1 rounded text-sm dark:bg-zinc-800 dark:text-white"
              >
                <option value="all">All Solutions</option>
                <option value="accepted">Accepted Only</option>
                <option value="not_accepted">Not Accepted</option>
                <option value="mine">Submitted by Me</option>
              </select>
            </div>
            
            {isSolutionsLoading ? (
              <p className="text-center py-4">Loading solutions...</p>
            ) : (
              <SolutionReplies
                allSolutions={allSolutionsResponse?.data || []}
                onViewSolution={handleViewSolution}
                selectedSolution={selectedSolution}
                setSelectedSolution={setSelectedSolution}
                fetchSolutions={refetchSolutions} 
                problemId={id} 
                filterStatus={filterStatus}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {showEditor
                ? "Submit Your Solution"
                : `${selectedSolution?.username || selectedSolution?.uploaderName || "User"}'s Solution`}
            </h2>
            {!showEditor && (
              <button
                onClick={handleResetEditor}
                className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + Submit Your Own Solution
              </button>
            )}
          </div>
    {console.log("problem ",problem.data," curr ",currentUserEmail)}
          <SolutionInput
            showEditor={showEditor}
            selectedSolution={selectedSolution}
            // 🟢 FIX: Access inner data object and compare with fetched email
            isUploader={problem?.data?.email === currentUserEmail}
            problemId={id}
            fetchSolutions={refetchSolutions} 
            filterStatus={filterStatus}
          />
        </div>
      </div>
    </div>
  );
}