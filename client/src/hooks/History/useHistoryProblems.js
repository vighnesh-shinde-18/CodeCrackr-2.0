import { useQuery } from "@tanstack/react-query";
import historyService from "../../api/HistoryServices.js";

function useHistoryProblems({ topicFilter, acceptedFilter, page, limit }) {

  let acceptedPayload;
  if (acceptedFilter === "Accepted") acceptedPayload = true;
  else if (acceptedFilter === "Not Accepted") acceptedPayload = false;

  return useQuery({
    queryKey: ["history-problems", topicFilter, acceptedFilter, page],

    queryFn: () =>
      historyService.UserSolvedProblems({
        topic: topicFilter,
        accepted: acceptedPayload,
        page,
        limit
      }),

    placeholderData: (prev) => prev,
    staleTime: 60 * 1000
  });
}

export { useHistoryProblems };