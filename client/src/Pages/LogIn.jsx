import LoginForm from "../components/ui/login-form.jsx"
import asyncHandler from "../../../server/utils/asyncHandler.js";
import authService from "../api/AuthServices.jsx";
import { toast } from 'sonner'
import { useState } from 'react'
import { useNavigate } from "react-router";

function LogIn() {

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()

    const loginUser = asyncHandler(async function ({ email, password, username }) {

        const toastId = toast.loading("Logining  User...");
        setIsLoading(true);

        try {

            const infoObj = { email, password }
             await authService.login(infoObj)

            toast.success("Login Successful! Redirect To Dashboard...", { id: toastId });
            navigate("/dashboard")
        } catch (error) {

            const userErrorMessage = error.message || "An unknown error occurred.";

            console.error("Frontend Error:", error);

            toast.error(userErrorMessage, { id: toastId });

        } finally {
            // Remove loading toast and stop spinner in case of success or failure
            setIsLoading(false);

        }
    })
    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
            <LoginForm onSubmit={loginUser} loading={isLoading} />
        </section>
    )
}

export default LogIn;