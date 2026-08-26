import { useQuery } from "@tanstack/react-query";
import problemService from "../../api/ProblemServices";

function useMyProblems(topicFilter) {
  return useQuery({
    queryKey: ["my-problems", topicFilter],
    queryFn: () =>
      problemService.fetchUserUploadProblem({ topicFilter }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true
  });
}

export { useMyProblems };