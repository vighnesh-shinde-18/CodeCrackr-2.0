import React, { useState } from "react"
import { Eye, EyeOff, GalleryVerticalEnd, LogIn } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

export default function LoginForm({ onSubmit, loading = false }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <GalleryVerticalEnd className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Code<span className="text-blue-600">Crackr</span></h1>
            </div>
          </div>
          <h1 className="text-xl text-center font-bold">Welcome Back, Login Please</h1>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="pr-10"
            />
            <div
              className="absolute right-3 top-7.5 cursor-pointer text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>

            <span
              className="text-sm mt-1 text-right text-blue-600 underline cursor-pointer hover:text-blue-800"
            //   onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>

      <div className="text-muted-foreground text-center text-xs mt-6 *:[a]:underline *:[a]:underline-offset-4"> <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => navigate("/register")}
        >
          Register Now
        </span>
      </p>
      </div>
    </div>
  )
}