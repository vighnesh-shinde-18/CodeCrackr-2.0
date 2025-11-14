import React, { useState } from "react";
import { Eye, EyeOff, GalleryVerticalEnd, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function RegisterForm({onSubmit, loading = false }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, username, password });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center items-center gap-2">
            <GalleryVerticalEnd className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">
              Code<span className="text-blue-600">Crackr</span>
            </h1>
          </div>
          <h2 className="text-xl font-bold">Create your account</h2>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" 
          />
        </div>
 
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="your_username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
 
        <div className="grid gap-2 relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-8 text-muted-foreground cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
 
        <Button type="submit" className="w-full gap-2 cursor-pointer" disabled={loading}>
          <UserPlus className="w-4 h-4" />
          {loading ? "Registering..." : "Register"}
        </Button>
        <p className="text-sm text-center text-muted-foreground mt-4">
          Already have an account?{" "}
          <span
            className="text-primary underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}