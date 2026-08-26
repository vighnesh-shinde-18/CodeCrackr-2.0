import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query"; 
import authService from "../../api/AuthServices";
function useResetPassword() {
     const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => authService.resetPassword(payload),

    onMutate: () => toast.loading("Resetting password..."),

    onSuccess: () => {
      toast.dismiss();
      toast.success("Password reset successful");
      navigate("/login")
    },

    onError: () => {
      toast.dismiss();
      toast.error("Invalid OTP");
    }
  });
}

export {useResetPassword}