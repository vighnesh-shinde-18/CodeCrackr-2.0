import { useMutation, useQueryClient } from "@tanstack/react-query";
import solutionService from "../../api/SolutionServices";
import { toast } from "sonner";

function useSubmitSolution(problemId) {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (payload) =>
      solutionService.SubmitSolution(problemId, payload),

    onSuccess: () => {

      toast.success("Solution submitted");

      queryClient.invalidateQueries([
        "solutions",
        problemId
      ]);

    },

    onError: () => toast.error("Failed to submit solution")

  });

}

export { useSubmitSolution };