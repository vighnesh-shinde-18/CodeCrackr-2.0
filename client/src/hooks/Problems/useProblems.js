import { useQuery } from "@tanstack/react-query";
import problemService from "../../api/ProblemServices.js";

function useProblems({ search, topic, status, page, limit }) {
  return useQuery({
    queryKey: ["problems", search, topic, status, page],
    queryFn: () =>
      problemService.fetchAllProblmes({
        search,
        topic,
        status,
        page,
        limit,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous
  });
}

export { useProblems };