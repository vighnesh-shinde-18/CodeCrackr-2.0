"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"; // Removed other models, we don't need them for server-side
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "../ui/badge.jsx";

import { useDebounce } from "../../hooks/useDebounce";
import problemService from "../../api/ProblemServices.js";
import ProblemFilters from "./ProblemFilter.jsx";
import ProblemDataTable from "./ProblemDataTable.jsx";

function ProblemTable() {
    const navigate = useNavigate();

    // --- State Management ---
    const [filter, setFilter] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // 🟢 1. Add Page State
    const [page, setPage] = useState(1);
    const limit = 10; // Fixed limit per your requirement

    // --- Debounce ---
    const debouncedSearch = useDebounce(filter, 400);

    // --- React Query ---
    const { data: topics = [] } = useQuery({
        queryKey: ["problem-topics"],
        queryFn: () => problemService.fetchAllTopics(),
        staleTime: Infinity,
    });
    const topicOptions = useMemo(() => ["All", ...topics], [topics]);

    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["problems", debouncedSearch, selectedTopic, statusFilter, page],
        queryFn: async () => {
            return await problemService.fetchAllProblmes({
                search: debouncedSearch,
                topic: selectedTopic,
                status: statusFilter,
                page: page,
                limit: limit
            });
        },
        // 🔥 TUNING:
        staleTime: 60 * 1000, // 1 Minute Freshness
        placeholderData: (previousData) => previousData, // Keeps "Page 1" visible while loading "Page 2"
    });


    const problems = useMemo(() => {
        console.log("API Response:", apiResponse);
        return apiResponse?.data || []; // 🟢 Added "return"
    }, [apiResponse]);
    
    // 🟢 4. Extract Pagination Metadata from API response
    const pagination = useMemo(() => apiResponse?.pagination || {
        totalPages: 1,
        page: 1,
        hasNextPage: false
    }, [apiResponse]);

    // --- Table Columns ---
    const columns = useMemo(() => [
        {
            id: "index",
            header: "Sr.No.",
            // Calculate correct index across pages: (page - 1) * limit + index + 1
            cell: ({ row }) => <div className="font-medium">{((page - 1) * limit) + row.index + 1}</div>
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <div className="text-sm font-medium">{row.getValue("title")}</div>
        },
        {
            accessorKey: "topics",
            header: "Topics",
            cell: ({ row }) => {
                const topics = row.getValue("topics") || [];
                return topics.map((topic, index) => (<Badge className="mx-0.5" variant="secondary" key={index}>{topic}</Badge>))
            }
        },
        {
            accessorKey: "replied",
            header: "You Replied",
            cell: ({ row }) => row.getValue("replied") ? (
                <div className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="size-4" /> Replied
                </div>
            ) : (
                <div className="flex items-center gap-1 text-red-500 font-medium">
                    <XCircle className="size-4" /> Not Replied
                </div>
            )
        },
        {
            accessorKey: "accepted",
            header: "Accepted",
            cell: ({ row }) => row.getValue("accepted") ? (
                <div className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="size-4" /> Accepted
                </div>
            ) : (
                <div className="flex items-center gap-1 text-red-500 font-medium">
                    <XCircle className="size-4" /> Not Accepted
                </div>
            )
        },
    ], [page]); // Add page dependency for the index calculation

    const table = useReactTable({
        data: problems,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true, // Tell React Table we are handling pagination manually
    });

    const visitProblem = (id, original) => {
        const problemId = original._id || id;
        const titleUrl = original.title.replaceAll(" ", "-");
        navigate(`/solve-problem/${titleUrl}/${problemId}`);
    };

    return (
        <div className="w-full space-y-4">
            <ProblemFilters
                filter={filter}
                setFilter={(val) => { setFilter(val); setPage(1); }} // Reset to page 1 on search
                selectedTopic={selectedTopic}
                setSelectedTopic={(val) => { setSelectedTopic(val); setPage(1); }} // Reset to page 1 on filter
                statusFilter={statusFilter}
                setStatusFilter={(val) => { setStatusFilter(val); setPage(1); }} // Reset to page 1 on filter
                topicOptions={topicOptions}
            />

            {isLoading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading problems...</p>
                </div>
            ) : (
                <ProblemDataTable
                    table={table}
                    columns={columns}
                    visitProblem={visitProblem}
                    // 🟢 5. Pass pagination data and handlers to the child
                    pagination={pagination}
                    onNextPage={() => setPage(old => old + 1)}
                    onPrevPage={() => setPage(old => Math.max(old - 1, 1))}
                />
            )}
        </div>
    );
}
export default ProblemTable;