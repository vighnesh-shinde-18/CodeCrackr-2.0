import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import authService from "../api/AuthServices.js";
import { useMutation } from "@tanstack/react-query"; // 🟢 Import

const ResetPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();

    // 🟢 MUTATION: Reset Password
    const resetMutation = useMutation({
        mutationFn: (payload) => authService.resetPassword(payload),
        
        onMutate: () => {
            toast.loading("Resetting password...");
        },

        onSuccess: () => {
            toast.dismiss();
            toast.success("Password reset successful. Login now.");
            navigate("/login");
        },

        onError: (err) => {
            toast.dismiss();
            const message = err?.response?.data?.message || "Invalid OTP or email. Please try again.";
            toast.error(message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        resetMutation.mutate({ email, newPassword, otp });
    };

    return (
        <section className="w-full flex flex-row justify-center pt-44">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-6 border p-6 rounded-md shadow"
            >
                <h2 className="text-xl font-bold text-center">Reset Your Password</h2>

                <div className="grid gap-3">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                    />
                </div>

                <div className="grid gap-3">
                    <Label>OTP</Label>
                    <Input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                    />
                </div>

                <div className="grid gap-3">
                    <Label>New Password</Label>
                    <Input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full cursor-pointer" 
                    disabled={resetMutation.isPending}
                >
                    {resetMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
            </form>
        </section>
    );
};

export default React.memo(ResetPasswordPage);