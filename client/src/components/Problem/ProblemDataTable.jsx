import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "../ui/badge.jsx";
import { Button } from "@/components/ui/button";

function ProblemDataTable({
  problems,
  visitProblem,
  pagination,
  onNextPage,
  onPrevPage,
  isLoading,
}) {
  const { page, totalPages, hasNextPage } = pagination;

  if (isLoading) {
    return (
      <p className="text-center py-10 text-muted-foreground">
        Loading problems...
      </p>
    );
  }

  return (
    <>
      <div className="border rounded-md">

        <table className="w-full text-sm">

          <thead className="border-b bg-muted">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Topics</th>
              <th className="p-3 text-left">Replied</th>
              <th className="p-3 text-left">Accepted</th>
            </tr>
          </thead>

          <tbody>

            {problems.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No problems found
                </td>
              </tr>
            )}

            {problems.map((problem, index) => (
              <tr
                key={problem._id}
                className="border-b hover:bg-muted cursor-pointer"
                onClick={() => visitProblem(problem)}
              >

                <td className="p-3">{index + 1}</td>

                <td className="p-3 font-medium">{problem.title}</td>

                <td className="p-3">
                  {problem.topics?.map((topic) => (
                    <Badge key={topic} className="mr-1">
                      {topic}
                    </Badge>
                  ))}
                </td>

                <td className="p-3">
                  {problem.replied ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={16} /> Replied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle size={16} /> Not Replied
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {problem.accepted ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={16} /> Accepted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle size={16} /> Not Accepted
                    </span>
                  )}
                </td>

              </tr>
            ))}

          </tbody>
        </table>

      </div>

      {/* Pagination */}

      <div className="flex justify-between items-center py-3">

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">

          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={page === 1}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasNextPage}
          >
            Next
          </Button>

        </div>
      </div>
    </>
  );
}

export default ProblemDataTable;