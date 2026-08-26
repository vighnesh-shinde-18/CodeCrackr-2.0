import { useMutation } from "@tanstack/react-query";
import authService from "../../api/AuthServices";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function useRegister() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (credentials) => authService.createAccount(credentials),

        onMutate: () => {
            const toastId = toast.loading("Registering User...");
            return { toastId };
        },

        onSuccess: (data, variables, context) => {
            // Access the toastId from the context
            toast.dismiss(context?.toastId);
            toast.success("Registration Successful! Redirecting to Login...");
            navigate('/login');
        },

        onError: (error, variables, context) => {
            toast.dismiss(context?.toastId);
            const userErrorMessage = error?.message || "An unknown error occurred.";
            console.error("Frontend Error:", error);
            toast.error(userErrorMessage);
        }
    });
}

export {useRegister};