import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Layout Component (Assuming you still have this, otherwise remove)
import SiteHeader from "../components/Header/SiteHeader.jsx"

// ShadCN UI
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* -------------------------------------------------------------------------- */
/* TEMPORARY COMPONENTS                              */
/* -------------------------------------------------------------------------- */

// 1. Temporary Problem Details
const TempProblemDetails = ({ problem }) => {
  if (!problem) return <div className="p-4 text-zinc-500">Loading Problem...</div>;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
      <div className="flex gap-2">
        {problem.tags?.map((tag) => (
          <span key={tag} className="px-2 py-1 text-xs rounded-md bg-zinc-200 dark:bg-zinc-800">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {problem.description}
      </p>
    </div>
  );
};

// 2. Temporary Solution List
const TempSolutionReplies = ({ allSolutions=[], onViewSolution, selectedSolutionId, filterStatus, currentUserId }) => {
  // Simple local filter logic for the UI
  const filteredSolutions = useMemo(() => {
    if (!allSolutions) {return []}
    if (filterStatus === "accepted") return allSolutions.filter(s => s.accepted);
    if (filterStatus === "mine") return allSolutions.filter(s => s.userId === currentUserId);
    return allSolutions;
  }, [allSolutions, filterStatus, currentUserId]);

  if (filteredSolutions.length === 0) {
    return <div className="text-sm text-zinc-500 italic">No solutions found.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {filteredSolutions.map((sol) => {
        const isSelected = selectedSolutionId === (sol._id || sol.id);
        return (
          <button
            key={sol._id || sol.id}
            onClick={() => onViewSolution(sol)}
            className={`flex flex-col items-start w-full p-3 rounded-md border text-left transition-colors ${
              isSelected
                ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-700"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex justify-between w-full">
              <span className="font-semibold text-sm">{sol.username || "Anonymous"}</span>
              {sol.accepted && <span className="text-xs text-green-600 font-bold">✓ Accepted</span>}
            </div>
            <span className="text-xs text-zinc-500 mt-1">{sol.language}</span>
          </button>
        );
      })}
    </div>
  );
};

// 3. Temporary Editor / Input
const TempSolutionInput = ({ showEditor, selectedSolution }) => {
  if (!showEditor && selectedSolution) {
    return (
      <div className="h-full w-full p-4 bg-zinc-950 text-zinc-50 font-mono text-sm rounded-md overflow-auto">
        {/* Displaying code read-only */}
        <pre>{selectedSolution.code || "// No code provided"}</pre>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <textarea
        className="flex-1 w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="// Write your solution here..."
      />
      <div className="flex justify-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors">
          Submit Solution
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN PAGE COMPONENT                             */
/* -------------------------------------------------------------------------- */

export default function ProblemSolvingPage() {
  const { id } = useParams(); // Get problem ID from route
  const [problem, setProblem] = useState(null);
  const [allSolutions, setAllSolutions] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSolution, setSelectedSolution] = useState(null);
  const [showEditor, setShowEditor] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedSolutionId, setSelectedSolutionId] = useState(null);

  // 🔹 Fetch logged-in user
 

  // 🔹 Fetch solutions for a given problem
  const fetchSolutions = async (id) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/solutions/problem/${id}`,
        {
          withCredentials: true,
        }
      );
      setAllSolutions(data);
    } catch (err) {
      console.error("Error fetching replies:", err);
      setAllSolutions([]);
    }
  };

  // 🔹 Fetch the problem
  const fetchProblem = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/problems/${id}`, {
        withCredentials: true,
      });
      setProblem(data);
      fetchSolutions(data.id);
    } catch (err) {
      console.error("Error fetching problem:", err);
      setError(
        err?.response?.data?.error || "Failed to load problem. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch on mount
  useEffect(() => {
    // fetchCurrentUser();
    fetchProblem();
  }, [id]);

  // Sync selected reply with updated replies
  useEffect(() => {
    if (selectedSolution) {
      const updated = allSolutions.find(
        (r) =>
          r._id === selectedSolution._id || r.id === selectedSolution.id
      );
      if (updated) {
        setSelectedSolution(updated);
      }
    }
  }, [allSolutions]);

  // 🔹 View/Reset Handler
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* 1. Header stays at the top */}
      <SiteHeader />

      {/* 2. Main Content Area with Resizable Panels */}
      <div className="flex-1 p-4 h-[calc(100vh-4rem)]">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm"
        >
          {/* LEFT PANEL: Problem Details + Solution List */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full overflow-y-auto p-4 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              
              {/* Temp Component: Problem Details */}
              <TempProblemDetails problem={problem} />

              <div className="border-t dark:border-zinc-800"></div>

              {/* Solution List Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Other User Replies</h3>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border px-2 py-1 rounded text-sm dark:bg-zinc-900 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="all">All</option>
                    <option value="accepted">Accepted</option>
                    <option value="mine">Submitted by Me</option>
                  </select>
                </div>
                
                {/* Temp Component: Solution List */}
                <TempSolutionReplies
                  allSolutions={allSolutions}
                  onViewSolution={handleViewSolution}
                  selectedSolutionId={selectedSolutionId}
                  filterStatus={filterStatus}
                  currentUserId={currentUser.id}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* RIGHT PANEL: Editor / Viewer */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col p-4 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {showEditor
                    ? "Submit Your Solution"
                    : `${selectedSolution?.username || 'User'}'s Solution`}
                </h2>
                {!showEditor && (
                  <button
                    onClick={handleResetEditor}
                    className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    + New Solution
                  </button>
                )}
              </div>

              {/* Temp Component: Editor */}
              <div className="flex-1 overflow-hidden rounded-xl border dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                <TempSolutionInput
                  showEditor={showEditor}
                  selectedSolution={selectedSolution}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}