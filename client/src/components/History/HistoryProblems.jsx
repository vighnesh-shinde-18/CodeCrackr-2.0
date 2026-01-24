"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// 🟢 TanStack Import
import { useQuery } from "@tanstack/react-query";
import historyService from "../../api/HistoryServices.js";

export function HistoryProblems() {
  const navigate = useNavigate();

  // Filters & State
  const [topicFilter, setTopicFilter] = useState("All");
  const [acceptedFilter, setAcceptedFilter] = useState("All");
  const [availableTopics, setAvailableTopics] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  // 🟢 QUERY: Fetch Solved Problems
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["history-problems", topicFilter, acceptedFilter, page], 
    
    queryFn: async () => {
      // Convert UI filter strings to Booleans for Backend
      let acceptedPayload;
      if (acceptedFilter === "Accepted") acceptedPayload = true;
      else if (acceptedFilter === "Not Accepted") acceptedPayload = false;

      const data = await historyService.UserSolvedProblems({
        topic: topicFilter,
        accepted: acceptedPayload,
        page: page,
        limit: limit
      });
      return data || { data: [], pagination: {} };
    },

    // UX: Keep previous page data visible while loading next page
    placeholderData: (prev) => prev, 
    staleTime: 60 * 1000, 
  });

  const problems = apiResponse?.data || [];
  const pagination = apiResponse?.pagination || { totalPages: 1, hasNextPage: false };

  // 🟢 EFFECT: Extract Topics dynamically (Client-side optimization)
  useEffect(() => {
    if (problems.length > 0 && topicFilter === "All") {
      const uniqueTopics = Array.from(new Set(problems.flatMap(p => p.topics || []))).sort();
      // Only update if we actually found topics to prevent loops
      if (uniqueTopics.length > 0) setAvailableTopics(uniqueTopics);
    }
  }, [problems, topicFilter]);

  const handleNavigate = (original, problemId) => {
    const titleUrl = original.title.replaceAll(" ", "-");
    navigate(`/solve-problem/${titleUrl}/${problemId}`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-lg font-medium">Replied Problems</h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={topicFilter} onValueChange={(val) => { setTopicFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by Topic" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Topics</SelectItem>
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={acceptedFilter} onValueChange={(val) => { setAcceptedFilter(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Not Accepted">Not Accepted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* TABLE */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Sr.No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin size-5" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : problems.length > 0 ? (
              problems.map((p, index) => (
                <TableRow
                  key={p.id || index}
                  onClick={() => handleNavigate(p, p.id)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.topics?.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.accepted ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                        <CheckCircle2 className="size-4" /> Accepted
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-600 font-medium text-sm">
                        <XCircle className="size-4" /> Not Accepted
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No problems found matching these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION CONTROLS */}
      {problems.length > 0 && (
        <div className="flex justify-end gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">
                Page {page} of {pagination.totalPages}
            </span>
            <Button 
                variant="outline" size="sm" 
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                disabled={page === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
                variant="outline" size="sm" 
                onClick={() => setPage(old => old + 1)}
                disabled={!pagination.hasNextPage}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      )}
    </div>
  );
}