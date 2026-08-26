"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";

import { useProblemDetails } from "../hooks/Problems/useProblemDetails";
import { useSolutions } from "../hooks/Solutions/useSolutions";

import ProblemDetails from "../components/Problem/ProblemDetails";
import SolutionReplies from "../components/Solution/SolutionReplies";
import SolutionInput from "../components/Solution/SolutionInput";

export default function ProblemSolving() {

  const { id } = useParams();

  const [selectedSolution, setSelectedSolution] = useState(null);
  const [showEditor, setShowEditor] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: problem, isLoading: isProblemLoading } =
    useProblemDetails(id);

  const {
    data: solutionsResponse,
    isLoading: isSolutionsLoading
  } = useSolutions(id, filterStatus);

  const solutions = solutionsResponse?.data || [];

  const handleViewSolution = (solution) => {
    setSelectedSolution(solution);
    setShowEditor(false);
  };

  const handleResetEditor = () => {
    setSelectedSolution(null);
    setShowEditor(true);
  };

  if (isProblemLoading)
    return <div className="p-10 text-center">Loading problem...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT */}

        <div className="space-y-6">

          <ProblemDetails problem={problem?.data} />

          <div>

            <div className="flex justify-between items-center mb-3">

              <h3 className="text-lg font-semibold">
                Other User Replies
              </h3>

              <select
                value={filterStatus}
                onChange={(e)=>setFilterStatus(e.target.value)}
                className="border px-2 py-1 rounded text-sm"
              >
                <option value="all">All</option>
                <option value="accepted">Accepted</option>
                <option value="not_accepted">Not Accepted</option>
                <option value="mine">My Solutions</option>
              </select>

            </div>

            {isSolutionsLoading ? (
              <p className="text-center py-4">
                Loading solutions...
              </p>
            ) : (

              <SolutionReplies
                allSolutions={solutions}
                onViewSolution={handleViewSolution}
                selectedSolution={selectedSolution}
                setSelectedSolution={setSelectedSolution}
                problemId={id}
                filterStatus={filterStatus}
              />

            )}

          </div>

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          <div className="flex justify-between items-center">

            <h2 className="text-xl font-semibold">

              {showEditor
                ? "Submit Your Solution"
                : "View Solution"}

            </h2>

            {!showEditor && (
              <button
                onClick={handleResetEditor}
                className="text-sm px-4 py-2 rounded bg-blue-600 text-white"
              >
                Submit Your Own
              </button>
            )}

          </div>

          <SolutionInput
            showEditor={showEditor}
            selectedSolution={selectedSolution}
            problemId={id}
          />

        </div>

      </div>

    </div>
  );

}