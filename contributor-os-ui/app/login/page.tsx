/**
 * LOGIN / SIGN UP PAGE
 * 
 * Login and sign up page with GitHub OAuth button
 * Both login and sign up use the same GitHub OAuth flow
 */

import { GitHubLoginButton } from "@/components/auth/github-login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Command, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Command className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Contributor OS</CardTitle>
              <CardDescription className="mt-2">
                Your personal operating system for open-source contributions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <GitHubLoginButton />
            <p className="text-center text-sm text-muted-foreground">
              Sign in or sign up with your GitHub account to get started
            </p>
            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground mb-3">
                By signing in, you agree to connect your GitHub account
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Github className="h-3 w-3" />
                  <span>View your public repositories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-3 w-3" />
                  <span>Track open source contributions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-3 w-3" />
                  <span>Monitor your activity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Link 
            href="/dashboard" 
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Continue without signing in
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

