"use client";

import { useState, useMemo } from "react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
 
import { useDeleteInteraction,useDeleteAllInteractions } from "../../hooks/History/useDeleteAiHistory.js";

import { AiHistoryDialog } from "./AiHistoryDialog.jsx";

export function HistoryAiFeatures() {

  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [viewDialog, setViewDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data: apiResponse, isLoading } =
    useAiHistory({ filter, page, limit });

  const deleteMutation = useDeleteInteraction();
  const deleteAllMutation = useDeleteAllInteractions();

  const history = apiResponse?.data || [];

  const pagination =
    apiResponse?.pagination || {
      totalPages: 1,
      hasNextPage: false,
    };

  const availableFeatures = useMemo(
    () => [
      "GenerateCode",
      "ConvertCode",
      "ExplainCode",
      "DebugCode",
      "ReviewCode",
      "GenerateTestCases",
    ],
    []
  );

  const getDisplayName = (key) => {
    const map = {
      DebugCode: "Debug",
      ReviewCode: "Review",
      GenerateCode: "Generate",
      ExplainCode: "Explain",
      ConvertCode: "Convert",
      GenerateTestCases: "Testcases",
    };

    return map[key] || key;
  };

  const handleDelete = (id) => {
    if (confirm("Delete this interaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Delete all history?")) {
      deleteAllMutation.mutate();
    }
  };

  const handleView = (id) => {
    setSelectedId(id);
    setViewDialog(true);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">

      {/* HEADER */}

      <div className="flex justify-between items-center flex-wrap gap-4">

        <h3 className="text-lg font-medium">AI Feature Usage</h3>

        <div className="flex gap-2">

          <Select
            value={filter}
            onValueChange={(val) => {
              setFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Feature" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="All">All</SelectItem>

              {availableFeatures.map((f) => (
                <SelectItem key={f} value={f}>
                  {getDisplayName(f)}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending || history.length === 0}
          >
            {deleteAllMutation.isPending ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              "Delete All"
            )}
          </Button>

        </div>

      </div>

      <Separator />

      {/* TABLE */}

      <div className="border rounded-md">

        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>Sr.No.</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>

            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No usage history found
                </TableCell>
              </TableRow>
            ) : (
              history.map((item, i) => (

                <TableRow key={item._id || i}>

                  <TableCell>
                    {(page - 1) * limit + i + 1}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {getDisplayName(item.FeatureType)}
                    </Badge>
                  </TableCell>

                  <TableCell className="truncate max-w-[150px]">
                    {item.Title || "Untitled"}
                  </TableCell>

                  <TableCell className="truncate max-w-[200px] text-muted-foreground">
                    {item.UserInput}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">

                    <DropdownMenu>

                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem
                          onClick={() => handleView(item._id)}
                        >
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </TableCell>

                </TableRow>
              ))
            )}

          </TableBody>

        </Table>

      </div>

      {/* PAGINATION */}

      {history.length > 0 && (

        <div className="flex justify-end gap-2 items-center">

          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
          >
            <ChevronRight size={16} />
          </Button>

        </div>

      )}

      <AiHistoryDialog
        open={viewDialog}
        onOpenChange={setViewDialog}
        interactionId={selectedId}
      />

    </div>
  );
}