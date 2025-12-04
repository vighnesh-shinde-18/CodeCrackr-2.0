import { CheckCircle2, ThumbsUp, Flag, MessageSquare } from "lucide-react";
import { useState, useCallback, memo, useEffect, useRef } from "react";
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
  const [interactionData, setInteractionData] = useState({
    likesCount: 0,
    liked: false,
    reportCount: 0,
    reported: false,
  });

  const [loading, setLoading] = useState({
    like: false,
    report: false,
  });

  // synchronous in–flight flags (fix double-click issue)
 
  const replyCount = solution.replyCount || 0;

  // Sync local state when solution changes
  useEffect(() => {
    setInteractionData({
      likesCount: solution.likesCount || 0,
      liked: solution.liked,
      reportCount: solution.reportCount || 0,
      reported: solution.reported,
    });
  }, [solution]);

  // LIKE handler
  const handleToggleLike = useCallback(
    async (e) => {
      e.stopPropagation();

      // hard block double-tap while request in-flight
       

      setLoading((curr) => ({ ...curr, like: true }));

    
      try {
        const data = await solutionService.toggleLike(solution.id);

        // if backend returns canonical state, prefer that
        
      } catch (error) {
        // rollback on failure
        if (prevSnapshot) {
          setInteractionData(prevSnapshot);
        }
        console.error("Like failed:", error);
        toast.error("Failed to like solution");
      } finally {
          }
    },
    [solution.id]
  );

  // REPORT handler
  const handleToggleReport = useCallback(
    async (e) => {
      e.stopPropagation();

      if (reportInFlightRef.current) return;
      reportInFlightRef.current = true;

      setLoading((curr) => ({ ...curr, report: true }));

      let prevSnapshot;
      setInteractionData((prev) => {
        prevSnapshot = prev;
        const willReport = !prev.reported;
        return {
          ...prev,
          reported: willReport,
          reportCount: Math.max(
            0,
            prev.reportCount + (willReport ? 1 : -1)
          ),
        };
      });

      try {
        const data = await solutionService.toggleReport(solution.id);

        if (data) {
          setInteractionData((curr) => ({
            ...curr,
            reported:
              typeof data.reported === "boolean"
                ? data.reported
                : curr.reported,
            reportCount:
              typeof data.reportCount === "number"
                ? data.reportCount
                : curr.reportCount,
          }));

          if (data.reported) {
            toast.success("Solution reported.");
          } else {
            toast.info("Report removed.");
          }
        }
      } catch (error) {
        if (prevSnapshot) {
          setInteractionData(prevSnapshot);
        }
        console.error("Report failed:", error);
        toast.error("Failed to report solution");
      } finally {
        reportInFlightRef.current = false;
        setLoading((curr) => ({ ...curr, report: false }));
      }
    },
    [solution.id]
  );

  const { liked, likesCount, reported, reportCount } = interactionData;

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
          disabled={loading.like}
          className={`flex items-center gap-1 transition-colors ${
            liked ? "text-blue-600 font-semibold" : "hover:text-blue-500"
          } ${loading.like ? "opacity-60 cursor-wait" : ""}`}
          title="Like this solution"
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-blue-600" : ""}`} />
          <span>{likesCount}</span>
        </button>

        {/* REPORT BUTTON */}
        <button
          onClick={handleToggleReport}
          disabled={loading.report}
          className={`flex items-center gap-1 transition-colors ${
            reported ? "text-red-600 font-semibold" : "hover:text-red-500"
          } ${loading.report ? "opacity-60 cursor-wait" : ""}`}
          title="Report this solution"
        >
          <Flag className={`w-4 h-4 ${reported ? "fill-red-600" : ""}`} />
          <span>{reportCount}</span>
        </button>

        {/* REPLY COUNT (read-only) */}
        <div className="flex items-center gap-1 cursor-default">
          <MessageSquare className="w-4 h-4" />
          <span>{replyCount}</span>
        </div>
      </div>
    </div>
  );
};

export const MemoizedSolutionCard = memo(SolutionCard);
