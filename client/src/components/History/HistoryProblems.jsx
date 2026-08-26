"use client";

import { useState, useMemo } from "react";
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

import { useHistoryProblems } from "../../hooks/History/useHistoryProblems.js";

export function HistoryProblems() {

  const navigate = useNavigate();

  const [topicFilter, setTopicFilter] = useState("All");
  const [acceptedFilter, setAcceptedFilter] = useState("All");

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: apiResponse, isLoading } =
    useHistoryProblems({
      topicFilter,
      acceptedFilter,
      page,
      limit
    });

  const problems = apiResponse?.data || [];

  const pagination =
    apiResponse?.pagination || {
      totalPages: 1,
      hasNextPage: false
    };

  const topics = useMemo(() => {
    return Array.from(
      new Set(problems.flatMap(p => p.topics || []))
    );
  }, [problems]);

  const visitProblem = (problem) => {
    const titleUrl = problem.title.replaceAll(" ", "-");
    navigate(`/solve-problem/${titleUrl}/${problem.id}`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">

      {/* HEADER */}

      <div className="flex justify-between items-center flex-wrap gap-4">

        <h3 className="text-lg font-medium">Replied Problems</h3>

        <div className="flex gap-4">

          <Select
            value={topicFilter}
            onValueChange={(val) => {
              setTopicFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Topic" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="All">All Topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={acceptedFilter}
            onValueChange={(val) => {
              setAcceptedFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Status" />
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

      {/* TABLE */}

      <div className="border rounded-md">

        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>Sr.No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No problems found
                </TableCell>
              </TableRow>
            ) : (
              problems.map((p, i) => (
                <TableRow
                  key={p.id || i}
                  onClick={() => visitProblem(p)}
                  className="cursor-pointer hover:bg-muted"
                >

                  <TableCell>
                    {(page - 1) * limit + i + 1}
                  </TableCell>

                  <TableCell>{p.title}</TableCell>

                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {p.topics?.map((t, idx) => (
                        <Badge key={idx} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>

                    {p.accepted ? (
                      <span className="flex gap-2 text-green-600">
                        <CheckCircle2 size={16} /> Accepted
                      </span>
                    ) : (
                      <span className="flex gap-2 text-yellow-600">
                        <XCircle size={16} /> Not Accepted
                      </span>
                    )}

                  </TableCell>

                </TableRow>
              ))
            )}

          </TableBody>

        </Table>

      </div>

      {/* PAGINATION */}

      {problems.length > 0 && (

        <div className="flex justify-end gap-2 items-center">

          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16}/>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!pagination.hasNextPage}
          >
            <ChevronRight size={16}/>
          </Button>

        </div>

      )}

    </div>
  );
}