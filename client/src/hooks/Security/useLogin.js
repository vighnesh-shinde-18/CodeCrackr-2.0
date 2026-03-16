import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../../api/AuthServices"; // Adjust path as needed
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function useLogin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (credentials) => authService.login(credentials),

        onMutate: () => {
            // Start loading toast and return its ID inside the context object
            const toastId = toast.loading("Logging in...");
            return { toastId };
        },

        onSuccess: (res, context) => {
            toast.dismiss(context?.toastId);
            toast.success("Login Successful! Redirecting to Dashboard");

            // Update React Query cache instantly to trigger NavUser re-render
            queryClient.setQueryData(["current-user"], {
                username: res.data.user.username,
                email: res.data.user.email
            });

            navigate("/dashboard");
        },

        onError: (error, variables, context) => {
            toast.dismiss(context?.toastId);
            const message = error?.message || "An unknown error occurred.";
            console.error("Login Error:", error);
            toast.error(message);
        }
    });
}

export {useLogin}