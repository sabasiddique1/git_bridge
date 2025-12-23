/**
 * LOGOUT PAGE
 * 
 * Handles user logout
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/dashboard")
      router.refresh()
    }
    logout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">Logging out...</div>
    </div>
  )
}



