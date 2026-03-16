import { useQuery } from "@tanstack/react-query";
import replyService from "../../api/ReplyServices";

function useReplies(solutionId, showEditor) {

  return useQuery({
    queryKey: ["replies", solutionId],

    queryFn: async () => {
      if (!solutionId) return [];
      const res = await replyService.fetchAllReplies(solutionId);
      return res?.data || [];
    },

    enabled: !!solutionId && !showEditor,
    staleTime: 1000 * 30
  });

}

export { useReplies };