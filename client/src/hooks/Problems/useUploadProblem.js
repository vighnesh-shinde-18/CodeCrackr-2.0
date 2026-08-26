import { useMutation, useQueryClient } from "@tanstack/react-query";
import problemService from "../../api/ProblemServices.js";
import { toast } from "sonner";

function useUploadProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: problemService.uploadProblem,

    onSuccess: () => {
      toast.success("Problem submitted successfully!");

      // refresh lists
      queryClient.invalidateQueries(["my-problems"]);
      queryClient.invalidateQueries(["problems"]);
    },

    onError: (error) => {
      toast.error(error.message || "Submission failed");
    }
  });
}

export { useUploadProblem };