"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import problemService from "../../api/ProblemServices.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ADMIN_EMAIL_ENV = import.meta.env.VITE_ADMIN_EMAIL;

function ProblemDetails({ problem, loadProblem }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Get Problem ID safely
  const problemId = problem?.id || problem?._id;

  // Admin Check
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail && ADMIN_EMAIL_ENV && storedEmail === ADMIN_EMAIL_ENV) {
      setIsAdmin(true);
    }
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (id) => problemService.deleteProblem(id),
    onSuccess: () => {
      toast.success("Problem deleted successfully.");
      queryClient.invalidateQueries(["problems"]); 
      navigate("/problems");  
    },
    onError: (err) => toast.error(err.message || "Failed to delete problem"),
  });

  // 🟢 3. OPTIMISTIC REPORT MUTATION
  const reportMutation = useMutation({
    mutationFn: (id) => problemService.toggleReportProblem(id),

    // A. BEFORE API CALL (Happens Immediately)
    onMutate: async (id) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      // Assuming you fetch this problem with key ["problem", id]
      await queryClient.cancelQueries({ queryKey: ["problem", id] });

      // 2. Snapshot the previous value
      const previousProblem = queryClient.getQueryData(["problem", id]);

      // 3. Optimistically update to the new value
      if (previousProblem) {
         queryClient.setQueryData(["problem", id], (old) => {
            const isNowReported = !old.isReported;
            return {
               ...old,
               isReported: isNowReported,
               // If we just reported it (true), add 1. If we un-reported (false), minus 1.
               reportCount: isNowReported ? (old.reportCount || 0) + 1 : (old.reportCount || 1) - 1
            };
         });
      }

      // 4. Return context object with the snapshot
      return { previousProblem };
    },

    // B. IF API FAILS (Rollback)
    onError: (err, id, context) => {
      // Revert cache to the snapshot we took in onMutate
      if (context?.previousProblem) {
        queryClient.setQueryData(["problem", id], context.previousProblem);
      }
      toast.error("Failed to report problem. Changes reverted.");
    },

    // C. ALWAYS (Success or Error)
    onSettled: (data, error, id) => {
      // Refetch to ensure we are 100% in sync with server
      queryClient.invalidateQueries({ queryKey: ["problem", id] });
      
      // Legacy support if parent is not using React Query
      if (loadProblem) loadProblem();
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this problem?")) {
        deleteMutation.mutate(problemId);
    }
  };

  const handleToggleReport = () => {
    // Only allow clicking if not already submitting (optional, but good for safety)
    // For optimistic UI, we usually ALLOW it unless it breaks logic.
    if (problemId) reportMutation.mutate(problemId);
  };

  

  return (
    <div className="bg-white dark:bg-gray-900 shadow p-6 rounded-md space-y-5 border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
        <h1 className="text-2xl font-bold">{problem?.title}</h1>
        
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          {problem?.username && (
            <span className="text-sm text-muted-foreground">
              Uploaded by <span className="font-medium text-blue-600">{problem.username}</span>
            </span>
          )}

          <button
            onClick={handleToggleReport}
            // 🟢 Remove 'disabled' so it feels instant (or keep it if you want to prevent rapid clicking)
            disabled={reportMutation.isPending} 
            className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
              problem?.isReported 
                ? "text-red-500 font-medium" 
                : "text-gray-500 hover:text-red-500"
            }`}
            title="Report this problem"
          >
             {/* 🟢 Visual Logic: Use data from props (which are updated via cache) */}
             <Flag className={`w-4 h-4 ${problem?.isReported ? "fill-current" : ""}`} />
             <span>{problem?.reportCount || 0}</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 cursor-pointer"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300">{problem?.description}</p>

      <div>
        <strong>Topics:</strong>
        <div className="flex gap-2 mt-1 flex-wrap">
          {problem?.topics?.map((topic, i) => (
            <span
              key={i}
              className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white text-sm font-medium px-2.5 py-0.5 rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div>
        <strong>Test Cases:</strong>
        <ul className="list-disc ml-5 mt-2 text-sm">
          {problem?.testCases?.map((tc, i) => (
            <li key={i}>
              <span className="font-medium">Input:</span> {tc.input}{" "}
              <span className="font-medium ml-2">Output:</span> {tc.output}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProblemDetails;