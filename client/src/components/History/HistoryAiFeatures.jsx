"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Import the service
import historyService from "../../api/HistoryServices.jsx"; 
import AiResponseViewer from "../AiResponse/AiResponseViewer.jsx";

export function HistoryAiFeatures() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Mapping Backend "FeatureType" strings to UI Display names
  const featureMap = useMemo(() => ({
    DebugCode: "Debug",
    ReviewCode: "Review",
    GenerateCode: "Generate", 
    ExplainCode: "Explain",
    ConvertCode: "Convert",
    GenerateTestCases: "Testcases",
  }), []);

  const getDisplayName = useCallback((backendKey) => featureMap[backendKey] || backendKey, [featureMap]);

  // Simplified Fetch
  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await historyService.UserAiInteraction(filter);

      if (!result || !result.data) return;

      const formatted = result.data.map((item, idx) => ({
        _id: item._id,
        id: idx + 1,
        title: item.AiOutput?.title || "Untitled", 
        featureDisplay: getDisplayName(item.FeatureType), 
        featureType: item.FeatureType,
        prompt: item.UserInput, 
        response: item.AiOutput, 
        date: new Date(item.createdAt).toLocaleDateString(),
        fullDate: item.createdAt 
      }));

      if (filter !== "all" && filter !== "All") {
         setHistory(formatted.filter(item => item.featureType === filter));
      } else {
         setHistory(formatted);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load AI history");
    } finally {
      setLoading(false);
    }
  }, [getDisplayName, filter]);

  // Fetch on mount or when filter changes
  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  // View single interaction
  const handleView = (item) => {
    setSelectedInteraction(item);
    setViewDialog(true);
  };

  const handleDelete = (id) => {
    setHistory((prev) => prev.filter((item) => item._id !== id));
    toast.success("Interaction deleted successfully");
  };

  const handleDeleteAll = () => {
    if(!confirm("Are you sure you want to delete all history?")) return;
    setHistory([]);
    toast.success("All history cleared");
  };

  const availableFeatures = useMemo(() => {
     return ["GeneratCode", "ConvertCode", "ExplainCode", "DebugCode", "ReviewCode","GenerateTestCases"];
  }, []);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-medium">AI Feature Usage</h3>
        <div className="flex gap-2">
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Feature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {availableFeatures.map((fKey) => (
                <SelectItem key={fKey} value={fKey}>
                   {getDisplayName(fKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="destructive" onClick={handleDeleteAll}>Delete All</Button>
        </div>
      </div>

      <Separator />

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
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin size-5"/> Loading...
                </div>
              </TableCell>
            </TableRow>
          ) : history.length > 0 ? (
            history.map((f) => (
              <TableRow key={f._id}>
                <TableCell>{f.id}</TableCell>
                <TableCell><Badge variant="outline">{f.featureDisplay}</Badge></TableCell>
                <TableCell className="max-w-[180px] truncate font-medium">{f.title}</TableCell>
                <TableCell className="max-w-[250px] text-sm text-muted-foreground truncate">
                  {f.prompt && f.prompt.length > 80 ? f.prompt.slice(0, 80) + "..." : f.prompt}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{f.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(f)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(f._id)} className="text-red-600 focus:text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No AI feature usage found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="min-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {selectedInteraction?.title}
              {selectedInteraction && <Badge>{selectedInteraction.featureDisplay}</Badge>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4 text-sm">
            <div className="text-xs text-muted-foreground">
                Created on: {selectedInteraction && new Date(selectedInteraction.fullDate).toLocaleString()}
            </div>
            
            <div className="space-y-2">
              <strong className="block text-base">Your Prompt:</strong>
              <div className="bg-muted/50 p-4 rounded-md border text-sm font-mono whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                {selectedInteraction?.prompt}
              </div>
            </div>

            <Separator />
            
            <div className="space-y-2">
                <strong className="block text-base">AI Response:</strong>
                {/* Correction here:
                   1. response: passed selectedInteraction.response (the actual data), not selectedInteraction (the wrapper)
                   2. featureType: mapped the Display name (e.g. "Debug") to lowercase ("debug") to match AiResponseViewer
                */}
                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                    <AiResponseViewer 
                        isHistory={true} 
                        response={selectedInteraction?.response} 
                        featureType={selectedInteraction?.featureDisplay?.toLowerCase()}
                    />
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}