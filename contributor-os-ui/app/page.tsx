/**
 * HOME PAGE
 * 
 * Redirects to public dashboard
 */

import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
