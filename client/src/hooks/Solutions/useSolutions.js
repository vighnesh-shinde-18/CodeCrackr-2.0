import { useQuery } from "@tanstack/react-query";
import solutionService from "../../api/SolutionServices";

function useSolutions(problemId, filterStatus) {

  return useQuery({
    queryKey: ["solutions", problemId, filterStatus],

    queryFn: async () => {

      let params = {};

      if (filterStatus === "accepted") params.accepted = "true";
      else if (filterStatus === "not_accepted") params.accepted = "false";
      else if (filterStatus === "mine") params.submittedByMe = "true";

      return solutionService.fetchAllSolutions(problemId, params);

    },

    enabled: !!problemId,
    keepPreviousData: true
  });

}

export { useSolutions };