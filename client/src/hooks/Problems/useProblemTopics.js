import { useQuery } from "@tanstack/react-query";
import problemService from "../../api/ProblemServices.js";

function useProblemTopics() {
  return useQuery({
    queryKey: ["problem-topics"],
    queryFn: problemService.fetchAllTopics,
    staleTime: 60 * 1000
  });
}

export { useProblemTopics };