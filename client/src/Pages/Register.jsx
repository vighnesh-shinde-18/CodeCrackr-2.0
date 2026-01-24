// In Register.jsx
import RegisterForm from "../components/ui/register-form.jsx"
import authService from "../api/AuthServices.js";
import { toast } from 'sonner'
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query"; // 🟢 Import

function Register() {
    const navigate = useNavigate();

    // 🟢 MUTATION: Register User
    const registerMutation = useMutation({
        mutationFn: (userData) => authService.createAccount(userData),
        
        onMutate: () => {
            // Optional: Start a loading toast
            return toast.loading("Registering User...");
        },
        
        onSuccess: (data, variables, contextId) => {
            toast.dismiss(contextId); // Dismiss loading toast
            toast.success("Registration Successful! Redirecting to Login...");
            navigate('/login');
        },
        
        onError: (error, variables, contextId) => {
            toast.dismiss(contextId);
            const userErrorMessage = error.message || "An unknown error occurred.";
            console.error("Frontend Error:", error);
            toast.error(userErrorMessage);
        }
    });

    return (
        <section className="w-full flex flex-row justify-center pt-32">
            <RegisterForm 
                onSubmit={(data) => registerMutation.mutate(data)} 
                loading={registerMutation.isPending} 
            />
        </section>
    )
}

export default Register;