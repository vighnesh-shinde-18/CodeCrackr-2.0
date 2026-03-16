import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query"; // 🟢 Import
import authService from "../../api/AuthServices";


function useForgotPassword() {
     const navigate = useNavigate();

  return useMutation({
        mutationFn: (payload) => authService.sendOtp(payload),

    onMutate: () => toast.loading("Sending OTP..."),

    onSuccess: () => {
      toast.dismiss();
      toast.success("Password reset link sent to your email!");

      navigate("/reset-password");
    },

    onError: (err) => {
      toast.dismiss();
      console.error("Forgot password error:", err);
      toast.error(
        err?.response?.data?.error || "Email not registered or failed to send."
      );
    }
  });
}

export {useForgotPassword}