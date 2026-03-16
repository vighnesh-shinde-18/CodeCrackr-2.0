import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";

import { useDebounce } from "../../hooks/Debounce/useDebounce.js";
import { useProblems } from "../../hooks/Problems/useProblems.js";
import { useProblemTopics } from "../../hooks/Problems/useProblemTopics.js";

import problemService from "../../api/ProblemServices.js";

import { createProblemColumns } from "./ProblemColumns.jsx";
import ProblemFilters from "./ProblemFilter.jsx";
import ProblemDataTable from "./ProblemDataTable.jsx";
import { Loader } from "lucide-react";

function ProblemTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const limit = 10;

  const debouncedSearch = useDebounce(filter, 400);

  // 🟢 Fetch Topics
  const { data: topics = [] } = useProblemTopics();
  const topicOptions = useMemo(() => ["All", ...topics], [topics]);

  // 🟢 Fetch Problems
  const { data: apiResponse, isLoading } = useProblems({
    search: debouncedSearch,
    topic: selectedTopic,
    status: statusFilter,
    page,
    limit
  });

  const problems = useMemo(() => apiResponse?.data || [], [apiResponse]);

  const pagination = useMemo(
    () =>
      apiResponse?.pagination || {
        totalPages: 1,
        page: 1,
        hasNextPage: false
      },
    [apiResponse]
  );

  // 🟢 Prefetch Next Page (Performance Optimization)
  useEffect(() => {
    if (!pagination?.hasNextPage) return;

    queryClient.prefetchQuery({
      queryKey: [
        "problems",
        debouncedSearch,
        selectedTopic,
        statusFilter,
        page + 1
      ],
      queryFn: () =>
        problemService.fetchAllProblmes({
          search: debouncedSearch,
          topic: selectedTopic,
          status: statusFilter,
          page: page + 1,
          limit
        })
    });
  }, [
    pagination,
    debouncedSearch,
    selectedTopic,
    statusFilter,
    page,
    queryClient
  ]);

  // 🟢 Columns from external file
  const columns = useMemo(
    () => createProblemColumns(page, limit),
    [page]
  );

  const table = useReactTable({
    data: problems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  });

const visitProblem = (problem) => {
    const problemId = problem._id;
    // Added optional chaining just in case title is missing
    const titleUrl = problem.title?.replaceAll(" ", "-"); 
    navigate(`/solve-problem/${titleUrl}/${problemId}`);
  };

  return (
    <div className="w-full space-y-4">

      <ProblemFilters
        filter={filter}
        setFilter={(val) => {
          setFilter(val);
          setPage(1);
        }}
        selectedTopic={selectedTopic}
        setSelectedTopic={(val) => {
          setSelectedTopic(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        topicOptions={topicOptions}
      />

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
           <Loader/>
          </p>
        </div>
      ) : (
        <ProblemDataTable
        problems={problems} /* 🛠️ FIX 2: Explicitly pass the problems array */
          table={table}       /* Note: You are passing this, but currently ignoring it in the child */
          columns={columns}   /* Note: You are passing this, but currently ignoring it in the child */
          visitProblem={visitProblem}
          pagination={pagination}
          onNextPage={() => setPage((old) => old + 1)}
          onPrevPage={() => setPage((old) => Math.max(old - 1, 1))}
        />
      )}
    </div>
  );
}

export default ProblemTable;