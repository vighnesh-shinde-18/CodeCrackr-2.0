import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../../api/AuthServices.js";
import { toast } from "sonner";

function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      // Clear cached user
      queryClient.clear();

      toast.success("Logged out successfully");
    },

    onError: () => {
      toast.error("Logout failed");
    }
  });
}

export { useLogout };