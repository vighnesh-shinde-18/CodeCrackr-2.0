import { useMutation, useQueryClient } from "@tanstack/react-query";
import aiInteractionService from "../../api/AiInteractionsServices";

function useDeleteInteraction() {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiInteractionService.deleteInteractionById,

    onSuccess: () => {
           toast.success("Deleted successfully");
      queryClient.invalidateQueries(["ai-history"]);
    },
       onError: (err) => {
      toast.error(err.message || "Failed to delete");
    },
  });
}

function useDeleteAllInteractions() {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiInteractionService.deleteAllInteractions,

    onSuccess: () => {
         toast.success("All history cleared");
      queryClient.invalidateQueries(["ai-history"]);
    },

    onError: (err) => {
      toast.error(err.message || "Failed to clear history");
    },
  });
}

export { useDeleteInteraction, useDeleteAllInteractions };