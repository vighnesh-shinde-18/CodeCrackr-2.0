// In Register.jsx

import RegisterForm from "../components/ui/register-form.jsx"
import authService from "../api/AuthServices.jsx";
import asyncHandler from "../../../server/utils/asyncHandler.js";
import { toast } from 'sonner'
import { useState } from "react";
import { useNavigate } from "react-router";

function Register() {

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()


    const registerUser = asyncHandler(async function ({ email, password, username }) {

        const toastId = toast.loading("Registering User...");
        setIsLoading(true); 

        try {

            const infoObj = { email, password, username } 
          await authService.createAccount(infoObj)
           
            toast.success("Registration Successful! Redirect To Login...", { id: toastId });
            useNavigate('/login')
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
            <RegisterForm onSubmit={registerUser} loading={isLoading} />
        </section>
    )
}
export default Register;