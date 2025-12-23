/**
 * GITHUB LOGIN BUTTON
 * 
 * Button component to initiate GitHub OAuth flow
 */

"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useRouter } from "next/navigation"

export function GitHubLoginButton() {
  const router = useRouter()

  const handleLogin = () => {
    // Redirect to GitHub OAuth initiation endpoint
    window.location.href = "/api/auth/github"
  }

  return (
    <Button onClick={handleLogin} className="gap-2">
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  )
}

