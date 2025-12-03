// src/components/ProblemTable/ProblemTable.jsx (Main Component)

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import ProblemFilters from "./ProblemFilter.jsx";
import ProblemDataTable from "./ProblemDataTable.jsx";
// 💡 Updated imports for status icons
import { CheckCircle2, XCircle } from "lucide-react"; 
import { Badge } from "../ui/badge.jsx";
 
import problemService from "../../api/ProblemServices.jsx";


function ProblemTable() {
    // --- Data and State Management ---
    const [problems, setProblems] = useState([]); // Stores ALL fetched problems
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState(""); // Text search input
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [acceptedFilter, setAcceptedFilter] = useState("All");
    const [repliedFilter, setRepliedFilter] = useState("All");

    const navigate = useNavigate();
  
    const fetchProblems = useCallback(async () => {
        setIsLoading(true);
        try {
            // Your problemService.fetchAllProblmes() returns the array of problems
            const data = await problemService.fetchAllProblmes();
            setProblems(data);
            // ❌ Removed console.log(problems) as it uses stale state
        } catch (error) {
            console.error("Error fetching problems:", error);
            // Handle error, maybe show a toast
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProblems();
    }, [fetchProblems]);

    // --- 💡 Centralized Filtering Logic (Client-Side) ---
    const filteredData = useMemo(() => {
        return problems.filter((p) => {
            // A. Text Search (on Title)
            const matchesSearch = p.title.toLowerCase().includes(filter.toLowerCase());

            // B. Topic Dropdown
            const matchesTopic = selectedTopic === "All" || p.topics.includes(selectedTopic);

            // C. Accepted Dropdown
            const matchesAccepted =
                acceptedFilter === "All" ||
                (acceptedFilter === "Accepted" && p.accepted) ||
                (acceptedFilter === "Not Accepted" && !p.accepted);

            // D. Replied Dropdown
            const matchesReplied =
                repliedFilter === "All" ||
                (repliedFilter === "Replied" && p.replied) ||
                (repliedFilter === "Not Replied" && !p.replied);

            return matchesSearch && matchesTopic && matchesAccepted && matchesReplied;
        });
    }, [problems, filter, selectedTopic, acceptedFilter, repliedFilter]);

    // Calculate the unique topics for the dropdown
    const topicOptions = useMemo(() => {
        const allTopics = new Set();
        problems.forEach((p) => p.topics.forEach((t) => allTopics.add(t)));
        return ["All", ...Array.from(allTopics)];
    }, [problems]);

    // --- React Table Initialization ---
    const columns = useMemo(() => [
        {
            id: "index",
            header: "Sr.No.",
            cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <div className="text-sm">{row.getValue("title")}</div>
        },
        {
            accessorKey: "topics",
            header: "Topics",
            cell: ({ row }) => {
                const topics = row.getValue("topics") || [];
                return topics.map((topic, index) => (<Badge className="mx-0.5" variant="secondary" key={index}>{topic}</Badge>))
            }
        },
        // ✅ FIX: Changed 'accessForKey' to 'accessorKey' AND improved the 'Not Replied' status display
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
        // ✅ Improvement: Improved the 'Not Accepted' status display for consistency
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
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // No getFilteredRowModel needed as filtering is done manually via filteredData
    });

    const visitProblem = useCallback((id, original) => {
        const titleUrl = original.title.replaceAll(" ","-")
  
        navigate(`/solve-problem/${titleUrl}/${id}`);
    }, [navigate]);

    return (
        <div className="w-full space-y-4">
            <h2>All Problems</h2>

            <ProblemFilters
                filter={filter}
                setFilter={setFilter}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                acceptedFilter={acceptedFilter}
                setAcceptedFilter={setAcceptedFilter}
                repliedFilter={repliedFilter}
                setRepliedFilter={setRepliedFilter}
                topicOptions={topicOptions}
            />

            {isLoading ? (
                <p className="text-center py-8">Loading problems...</p>
            ) : (
                <ProblemDataTable
                    table={table}
                    columns={columns}
                    visitProblem={visitProblem}
                />
            )}
        </div>
    );
}
export default ProblemTable;