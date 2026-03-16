import authService from "../../api/AuthServices.js";
import { useQuery } from "@tanstack/react-query";

function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000
  });
}

export {useCurrentUser}