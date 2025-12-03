import { CheckCircle2, ThumbsUp, Flag, MessageSquare } from "lucide-react";
import { useState, useCallback, memo, useEffect } from "react";
import { toast } from "sonner";
import solutionService from "../../api/SolutionServices.jsx"; 

export default function SolutionReplies({
  allSolutions,
  onViewSolution,
  selectedSolutionId,
  setSelectedSolutionId,
}) {
  if (!allSolutions.length)
    return <p className="text-muted-foreground">No solutions yet.</p>;

  return (
    <div className="space-y-4">
      {allSolutions.map((solution) => (
        <MemoizedSolutionCard
          key={solution.id}
          solution={solution}
          isSelected={selectedSolutionId === solution.id}
          onSelect={() => {
            setSelectedSolutionId(solution.id);
            onViewSolution(solution);
          }}
        />
      ))}
    </div>
  );
}

const SolutionCard = ({ solution, isSelected, onSelect }) => {
  // 🔹 STATE INITIALIZATION
  const [likesCount, setLikesCount] = useState(solution.likesCount || 0);
  const [liked, setLiked] = useState(solution.liked || false);
  
  const [reportCount, setReportCount] = useState(solution.reportCount || 0);
  const [reported, setReported] = useState(solution.reported || false);
  
  const replyCount = solution.replyCount || 0;

  // 🔹 SYNC STATE WITH PROPS
  useEffect(() => {
    setLikesCount(solution.likesCount || 0);
    setLiked(solution.liked || false);
    setReportCount(solution.reportCount || 0);
    setReported(solution.reported || false);
  }, [solution]);

  // 🔹 HANDLE LIKE
  const handleToggleLike = useCallback(async (e) => {
    e.stopPropagation();

    // Prevent action if reported (Button is disabled, but double check here)
    if (reported) return;

    // Optimistic Update
    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(!liked);
    setLikesCount((prev) => (!liked ? prev + 1 : prev - 1));

    try {
      const data = await solutionService.toggleSolutionInteraction(solution.id, "like");
      
      if (data) {
        setLiked(data.active);
        setLikesCount(data.count);
      }
    } catch (error) {
      // Revert on Error
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("Failed to like solution");
    }
  }, [liked, likesCount, reported, solution.id]);

  // 🔹 HANDLE REPORT
  const handleToggleReport = useCallback(async (e) => {
    e.stopPropagation();

    // Prevent action if liked
    if (liked) return;

    // Optimistic Update
    const prevReported = reported;
    const prevCount = reportCount;

    setReported(!reported);
    setReportCount((prev) => (!reported ? prev + 1 : prev - 1));

    try {
      const data = await solutionService.toggleSolutionInteraction(solution.id, "report");

      if (data) {
        setReported(data.active);
        setReportCount(data.count);
        
        if (data.active) {
            toast.success("Solution reported.");
        } else {
            toast.info("Report removed.");
        }
      }
    } catch (error) {
      // Revert on Error
      setReported(prevReported);
      setReportCount(prevCount);
      toast.error("Failed to report solution");
    }
  }, [reported, reportCount, liked, solution.id]);

  return (
    <div
      onClick={onSelect}
      className={`p-4 border rounded-md cursor-pointer transition ${
        isSelected
          ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold">{solution.username || solution.uploader || "Unknown User"}</p>
        
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
          disabled={reported} // 🔹 DISABLE if reported
          className={`flex items-center gap-1 transition-colors ${
            reported 
              ? "opacity-50 cursor-not-allowed text-gray-400" 
              : liked 
                ? "text-blue-600 font-bold" 
                : "hover:text-blue-500"
          }`}
          title={reported ? "Cannot like a reported solution" : "Like this solution"}
        >
          {/* Explicit fill color ensures it stays colored */}
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-blue-600" : ""}`} />
          <span>{likesCount}</span>
        </button>

        {/* REPORT BUTTON */}
        <button
          onClick={handleToggleReport}
          disabled={liked} // 🔹 DISABLE if liked
          className={`flex items-center gap-1 transition-colors ${
            liked 
              ? "opacity-50 cursor-not-allowed text-gray-400" 
              : reported 
                ? "text-red-600 font-bold" 
                : "hover:text-red-500"
          }`}
          title={liked ? "Cannot report a liked solution" : "Report this solution"}
        >
          <Flag className={`w-4 h-4 ${reported ? "fill-red-600" : ""}`} />
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