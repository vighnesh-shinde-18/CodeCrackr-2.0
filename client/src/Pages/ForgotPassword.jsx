import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "../hooks/Security/useForgotPassword";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  // 🟢 MUTATION: Send OTP
  const forgotPasswordMutation = useForgotPassword()

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email });
    setEmail("");
  };

  return (
    <section className="w-full h-2/4 flex flex-row justify-center pt-44">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 border p-6 rounded-md shadow-md bg-white dark:bg-zinc-900 dark:border-zinc-800 transition"
      >
        <div className="text-center">
          <h2 className="text-xl font-bold">Reset your password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your registered email. We’ll send a reset link.
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <Button
          type="submit"
          className="cursor-pointer w-full"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
        </Button>

        <p
          className="text-sm text-blue-600 underline cursor-pointer text-center"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </form>
    </section>
  );
}