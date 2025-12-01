"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

// API Service
import historyService from "../../api/HistoryServices.jsx"; // Adjust path as needed

export function HistoryProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [topicFilter, setTopicFilter] = useState("All");
  const [acceptedFilter, setAcceptedFilter] = useState("All");
  
  // Store all unique topics found (to populate dropdown even when filtering)
  const [availableTopics, setAvailableTopics] = useState([]);

  const navigate = useNavigate();

  // 1. Fetch Logic
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      // Prepare payload matches Backend expectation
      // Backend expects: topic (string), accepted (boolean or undefined/"All")
      
      let acceptedPayload;
      if (acceptedFilter === "Accepted") acceptedPayload = true;
      else if (acceptedFilter === "Not Accepted") acceptedPayload = false;
      else acceptedPayload = undefined; // or "All" depending on your backend logic

      const data = await historyService.UserSolvedProblems({
        topic: topicFilter,
        accepted: acceptedPayload
      });

      setProblems(data);

      // If we are viewing "All", update the available topics list
      // This prevents the dropdown from shrinking when we select a specific topic
      if (topicFilter === "All") {
        const uniqueTopics = Array.from(new Set(data.flatMap(p => p.topics))).sort();
        setAvailableTopics(uniqueTopics);
      }

    } catch (err) {
      console.error("Failed to load solved problems:", err);
      // Optional: Add toast notification here
    } finally {
      setLoading(false);
    }
  }, [topicFilter, acceptedFilter]);

  // 2. Trigger Fetch on Filter Change
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // 3. Navigation Handler
  const handleNavigate = (id) => {
    navigate(`/solve-problem/${id}`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-lg font-medium">Replied Problems</h3>

        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* Topic Filter */}
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Topics</SelectItem>
              {availableTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={acceptedFilter} onValueChange={setAcceptedFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Not Accepted">Not Accepted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

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
            {loading ? (
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
                  key={p.id}
                  onClick={() => handleNavigate(p.id)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.topics?.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {t}
                        </Badge>
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
    </div>
  );
}