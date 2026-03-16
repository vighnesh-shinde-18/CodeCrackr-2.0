import { useQuery } from "@tanstack/react-query";
import historyService from "../../api/HistoryServices";

function useAiHistory(filter, page, limit) {
  return useQuery({
    queryKey: ["ai-history", filter, page],
    queryFn: () =>
      historyService.UserAiInteraction({
        filter,
        page,
        limit
      }),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000
  });
}

export { useAiHistory };