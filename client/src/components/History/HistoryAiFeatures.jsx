"use client";

import { useState, useMemo } from "react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import historyService from "../../api/HistoryServices.js";
import aiInteractionService from "../../api/AiInteractionsServices.js";

// 🟢 Import the new Child Component
import { AiHistoryDialog } from "./AiHistoryDialog.jsx"; 

export function HistoryAiFeatures() {
  const [filter, setFilter] = useState("All");
  
  // Dialog State
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // Just store ID now
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();

  // Helper: Feature Names
  const getDisplayName = (key) => {
    const map = {
      DebugCode: "Debug", ReviewCode: "Review", GenerateCode: "Generate",
      ExplainCode: "Explain", ConvertCode: "Convert", GenerateTestCases: "Testcases",
    };
    return map[key] || key;
  };

  // 🟢 1. QUERY: Fetch List (Summaries Only)
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["ai-history", filter, page],
    queryFn: async () => {
      // Passes filter/page/limit to your GET service
      const result = await historyService.UserAiInteraction({ filter, page, limit });
      return result || { data: [], pagination: {} };
    },
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
  });

  const history = apiResponse?.data || [];
  const pagination = apiResponse?.pagination || { totalPages: 1, hasNextPage: false };

  // 🟢 2. MUTATION: Delete Single
  const deleteMutation = useMutation({
    mutationFn: (id) => aiInteractionService.deleteInteractionById(id),
    onSuccess: (_, id) => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries(["ai-history"]);
      // Close dialog if user deletes the open item
      if (selectedId === id) setViewDialog(false);
    },
    onError: (err) => toast.error(err.message || "Failed to delete"),
  });

  // 🟢 3. MUTATION: Delete All
  const deleteAllMutation = useMutation({
    mutationFn: () => aiInteractionService.deleteAllInteractions(),
    onSuccess: () => {
      toast.success("All history cleared");
      queryClient.invalidateQueries(["ai-history"]);
      setViewDialog(false);
    },
    onError: (err) => toast.error(err.message || "Failed to clear history"),
  });

  // Handlers
  const handleDelete = (id) => {
    if (confirm("Delete this interaction?")) deleteMutation.mutate(id);
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure? This will delete ALL history.")) deleteAllMutation.mutate();
  };

  const handleView = (id) => {
    setSelectedId(id);
    setViewDialog(true);
  };

  const availableFeatures = useMemo(() => 
    ["GenerateCode", "ConvertCode", "ExplainCode", "DebugCode", "ReviewCode", "GenerateTestCases"], 
  []);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-medium">AI Feature Usage</h3>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(val) => { setFilter(val); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter Feature" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {availableFeatures.map((fKey) => (
                <SelectItem key={fKey} value={fKey}>{getDisplayName(fKey)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="destructive" 
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending || history.length === 0}
          >
            {deleteAllMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete All"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* --- TABLE --- */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr.No.</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Prompt Preview</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="animate-spin size-5 mx-auto"/>
                </TableCell>
              </TableRow>
            ) : history.length > 0 ? (
              history.map((f, i) => (
                <TableRow key={f._id || i}>
                  <TableCell>{(page - 1) * limit + i + 1}</TableCell>
                  <TableCell><Badge variant="outline">{getDisplayName(f.FeatureType)}</Badge></TableCell>
                  {/* Title might be directly on object OR inside AiOutput depending on your schema version */}
                  <TableCell className="max-w-[150px] truncate font-medium">
                    {f.Title || "Untitled Interaction"}
                  </TableCell>
                  <TableCell className="max-w-[200px] text-sm text-muted-foreground truncate">
                    {f.UserInput}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(f._id)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(f._id)} className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No usage history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- PAGINATION --- */}
      {history.length > 0 && (
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

      {/* 🟢 NEW DIALOG COMPONENT */}
      <AiHistoryDialog 
        open={viewDialog} 
        onOpenChange={setViewDialog} 
        interactionId={selectedId} 
      />

    </div>
  );
}