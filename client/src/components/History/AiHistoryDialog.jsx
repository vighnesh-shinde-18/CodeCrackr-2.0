"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import aiInteractionService from "../../api/AiInteractionsServices.js";
import AiResponseViewer from "../AiResponse/AiResponseViewer.jsx";

export function AiHistoryDialog({ interactionId, open, onOpenChange }) {
  
  // 🟢 QUERY: Fetch Full Details (Only when Dialog is OPEN)
  const { data: fullInteraction, isLoading, isError } = useQuery({
    queryKey: ["ai-interaction-detail", interactionId],
    queryFn: () => aiInteractionService.getInteractionById(interactionId),
    enabled: !!interactionId && open, // 🔥 Only fetch if ID exists AND dialog is open
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[800px] max-h-[85vh] overflow-y-auto">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching full interaction details...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-10 text-red-500">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p>Failed to load details. The record might have been deleted.</p>
          </div>
        ) : fullInteraction ? (
          
          /* Success State - Render Viewer */
          <AiResponseViewer 
            isHistory={true} 
            response={fullInteraction.data.AiOutput} 
            featureType={fullInteraction.data.FeatureType}
          />
          
        ) : null}
        
      </DialogContent>
    </Dialog>
  );
}