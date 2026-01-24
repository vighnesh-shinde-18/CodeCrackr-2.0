import LoginForm from "../components/ui/login-form.jsx" 
import authService from "../api/AuthServices.js";
import { toast } from 'sonner'
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // 🟢 Import QueryClient

function LogIn() {
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // 🟢 Initialize

    const loginMutation = useMutation({
        mutationFn: (credentials) => authService.login(credentials),
        onMutate: () => {
             return toast.loading("Logging in...");
        },
        onSuccess: (res) => {
            toast.dismiss();
            toast.success("Login Successful!");
       
            // If backend sends avatar, save it too
            // 🟢 2. UPDATE REACT QUERY CACHE INSTANTLY
            // This triggers NavUser to re-render immediately
            queryClient.setQueryData(["current-user"], {
                username: res.data.user.username,
                email: res.data.user.email
            });
            
            navigate("/dashboard");
        },
        onError: (error) => {
            toast.dismiss();
            const message = error.message || "An unknown error occurred.";
            toast.error(message);
        }
    });

    return (
        <section className="w-full flex flex-row justify-center pt-32">
            <LoginForm 
                onSubmit={(data) => loginMutation.mutate(data)} 
                loading={loginMutation.isPending} 
            />
        </section>
    )
}

export default LogIn;