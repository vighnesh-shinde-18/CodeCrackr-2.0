"use client";

import { CheckCircle2, ThumbsUp, Flag, MessageSquare } from "lucide-react";
import { memo, useRef } from "react";
import { toast } from "sonner";
import solutionService from "../../api/SolutionServices.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function SolutionReplies({
  allSolutions,
  onViewSolution,
  selectedSolution,
  setSelectedSolution,
  problemId,
  filterStatus = "all"
}) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: allSolutions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  if (!allSolutions.length)
    return <p className="text-muted-foreground text-center py-4">No solutions yet.</p>;

  return (
    <div ref={parentRef} className="h-[600px] overflow-y-auto pr-2 border rounded-md">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const solution = allSolutions[virtualRow.index];
          return (
            <div
              key={solution.id || solution._id || virtualRow.index}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)`,
              }}
              className="pb-3"
            >
              <MemoizedSolutionCard
                solution={solution}
                isSelected={selectedSolution?.id === solution?.id}
                onSelect={() => { setSelectedSolution(solution); onViewSolution(solution); }}
                problemId={problemId}
                filterStatus={filterStatus} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 🟢 THE OPTIMISTIC CARD COMPONENT
const SolutionCard = ({ solution, isSelected, onSelect, problemId, filterStatus }) => {
  const queryClient = useQueryClient();
  
  // 🔥 MUST MATCH PARENT KEY EXACTLY
  const queryKey = ["solutions", problemId, filterStatus]; 

  // 🟢 1. OPTIMISTIC LIKE
  const likeMutation = useMutation({
    mutationFn: (id) => solutionService.toggleLike(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;

        // ⚠️ CRITICAL FIX: Handle { data: [...] } structure
        const solutionList = Array.isArray(old) ? old : (old.data || []);
        
        const updatedList = solutionList.map((sol) => {
            const solId = sol.id || sol._id;
            if (solId === id) {
                const isCurrentlyLiked = sol.liked;
                return {
                    ...sol,
                    liked: !isCurrentlyLiked, // Flip it
                    likesCount: isCurrentlyLiked ? (sol.likesCount - 1) : (sol.likesCount + 1)
                };
            }
            return sol;
        });

        // Return structure matching original state
        return Array.isArray(old) ? updatedList : { ...old, data: updatedList };
      });

      return { previousData };
    },

    onError: (err, id, context) => {
      toast.error("Failed to like solution");
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 🟢 2. OPTIMISTIC REPORT (Red Flag Immediately)
  const reportMutation = useMutation({
    mutationFn: (id) => solutionService.toggleReport(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;

        // ⚠️ CRITICAL FIX: Handle structure
        const solutionList = Array.isArray(old) ? old : (old.data || []);

        const updatedList = solutionList.map((sol) => {
             const solId = sol.id || sol._id;
             if (solId === id) {
                 const isCurrentlyReported = sol.reported; // or sol.isReported
                 return {
                     ...sol,
                     reported: !isCurrentlyReported, // Flip Flag
                     reportCount: isCurrentlyReported ? (sol.reportCount - 1) : (sol.reportCount + 1)
                 };
             }
             return sol;
        });

        return Array.isArray(old) ? updatedList : { ...old, data: updatedList };
      });

      return { previousData };
    },

    onError: (err, id, context) => {
       toast.error("Failed to report solution");
       if (context?.previousData) {
         queryClient.setQueryData(queryKey, context.previousData);
       }
    },

    onSettled: () => {
       queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleToggleLike = (e) => {
    e.stopPropagation();
    likeMutation.mutate(solution.id || solution._id);
  };

  const handleToggleReport = (e) => {
    e.stopPropagation();
    reportMutation.mutate(solution.id || solution._id);
  };

  // UI Variables (Driven by cache)
  const likesCount = solution.likesCount || 0;
  const isLiked = solution.liked || false;
  const reportCount = solution.reportCount || 0;
  const isReported = solution.reported || false; // Ensure backend sends 'reported' or 'isReported'
  const replyCount = solution.replyCount || 0;
 

  return (
    <div
      onClick={onSelect}
      className={`p-4 border rounded-md cursor-pointer transition h-full ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold">
          {solution.username || solution.uploader || "Unknown User"}
        </p>

        {solution.accepted && (
          <div className="flex items-center text-green-600 text-sm gap-1">
            <CheckCircle2 className="size-4" />
            Accepted
          </div>
        )}
      </div>

      <p className="text-sm mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
        {solution.explanation}
      </p>

      <div className="flex items-center mt-3 gap-4 text-sm text-gray-500 dark:text-gray-300">
        
        {/* LIKE BUTTON */}
        <button
          onClick={handleToggleLike}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-1 transition-colors ${
            isLiked ? "text-blue-600 font-semibold" : "hover:text-blue-500"
          }`}
          title="Like"
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-blue-600" : ""}`} />
          <span>{likesCount}</span>
        </button>

        {/* REPORT BUTTON */}
        <button
          onClick={handleToggleReport}
          disabled={reportMutation.isPending}
          className={`flex items-center gap-1 transition-colors ${
            isReported ? "text-red-600 font-semibold" : "hover:text-red-500"
          }`}
          title="Report"
        >
          <Flag className={`w-4 h-4 ${isReported ? "fill-red-600" : ""}`} />
          <span>{reportCount}</span>
        </button>

        {/* REPLY COUNT */}
        <div className="flex items-center gap-1 cursor-default">
          <MessageSquare className="w-4 h-4" />
          <span>{replyCount}</span>
        </div>
      </div>
    </div>
  );
};

export const MemoizedSolutionCard = memo(SolutionCard);