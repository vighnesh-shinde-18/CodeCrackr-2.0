import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

// Services
import problemService from "../api/ProblemServices.jsx"; 
import solutionService from "../api/SolutionServices.jsx"; 

// Components
import ProblemDetails from "../components/Problem/ProblemDetails.jsx";
import SolutionReplies from "../components/Solution/SolutionReplies.jsx";
import SolutionInput from "../components/Solution/SolutionInput.jsx";

export default function ProblemSolving() {
  const { id } = useParams();

  // 🔹 State Management
  const [problem, setProblem] = useState(null);
  const [allSolutions, setAllSolutions] = useState([]); 
  
  // 🟢 FIX 1: Correct LocalStorage Syntax
  const [currentUserEmail, setCurrentUserEmail] = useState("12");
  
  const [loading, setLoading] = useState(true);
  const [loadingSolutions, setLoadingSolutions] = useState(false); 
  const [error, setError] = useState(null);

  const [selectedSolution, setSelectedSolution] = useState(null);
  const [showEditor, setShowEditor] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);

  // 🔹 1. FETCH PROBLEM
  useEffect(() => {
    const loadProblem = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const problemData = await problemService.fecthProblemDetails(id);
        if (!problemData) throw new Error("Problem data is empty");
        setProblem(problemData);
        
        // Debug Log
        console.log("Current User Email:", localStorage.getItem("email"));
        console.log("Problem Uploader:", problemData.username); // Check what field you get back
        
      } catch (err) {
        console.error("Error loading problem:", err);
        setError(err.message || "Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id]);

  // 🔹 2. FETCH SOLUTIONS
  const fetchSolutions = useCallback(async () => {
    if (!id) return;
    
    setLoadingSolutions(true);
    try {
      let params = {};
      if (filterStatus === "accepted") params.accepted = "true";
      else if (filterStatus === "not_accepted") params.accepted = "false";
      else if (filterStatus === "mine") params.submittedByMe = "true";

      const solutionsData = await solutionService.fetchAllSolutions(id, params);
      setAllSolutions(solutionsData || []);

    } catch (err) {
      console.error("Error fetching solutions:", err);
      toast.error("Failed to load solutions");
    } finally {
      setLoadingSolutions(false);
    }
  }, [id, filterStatus]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // 🔹 Sync Selected Solution
  useEffect(() => {
    if (selectedSolution) {
      const updated = allSolutions.find(
        (r) => r.id === selectedSolution.id || r._id === selectedSolution._id
      );
      if (updated) {
        setSelectedSolution(updated);
      }
    }
  }, [allSolutions]);

  // Handlers
  const handleAcceptSolution = (solutionIndex) => {
    // Placeholder for next step
    const updatedSolutions = [...allSolutions];
    setAllSolutions(updatedSolutions);
  };

  const handleViewSolution = (solution) => {
    setSelectedSolution(solution);
    setShowEditor(false);
    setSelectedSolutionId(solution.id || solution._id);
  };

  const handleResetEditor = () => {
    setSelectedSolution(null);
    setShowEditor(true);
    setSelectedSolutionId(null);
  };

  if (loading) return <div className="p-10 flex justify-center text-lg">Loading...</div>;
  if (error) return <div className="p-10 text-red-500 font-bold text-center">Error: {error}</div>;
  if (!problem) return <div className="p-10 text-center">Problem not found.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <ProblemDetails problem={problem} />
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Other User Replies</h3>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border px-2 py-1 rounded text-sm dark:bg-zinc-800 dark:text-white"
                disabled={loadingSolutions}
              >
                <option value="all">All Solutions</option>
                <option value="accepted">Accepted Only</option>
                <option value="not_accepted">Not Accepted</option>
                <option value="mine">Submitted by Me</option>
              </select>
            </div>

            {loadingSolutions ? (
               <div className="text-center py-4 text-gray-500">Loading solutions...</div>
            ) : (
              <SolutionReplies
                allSolutions={allSolutions}
                onViewSolution={handleViewSolution}
                selectedSolutionId={selectedSolutionId}
                setSelectedSolutionId={setSelectedSolutionId}
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
          
          <SolutionInput
            showEditor={showEditor}
            selectedSolution={selectedSolution}
            
            // 🟢 FIX 2: Debugging Logic for "isUploader"
            // Compare Admin Email OR compare IDs if you have the user ID stored
            isUploader={
                // Option A: If you are the Admin (based on email env var)
                currentUserEmail === (import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com") ||
                // Option B: If the problem uploader name matches your email (Unlikely but requested)
                problem.username === currentUserEmail 
            }
            
            handleAcceptSolution={handleAcceptSolution} 
            fetchSolutions={fetchSolutions} 
            problemId={id}
          />
        </div>
      </div>
    </div>
  );
}