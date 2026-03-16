import { useQuery } from "@tanstack/react-query";
import problemService from "../../api/ProblemServices";

function useProblemDetails(id) {

  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemService.fecthProblemDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });

}

export { useProblemDetails };