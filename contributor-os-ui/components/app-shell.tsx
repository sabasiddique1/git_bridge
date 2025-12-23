"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { NotificationPanel } from "@/features/notifications/components/notification-panel"
import { useUIStore } from "@/stores/ui-store"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const notificationsOpen = useUIStore((state) => state.notificationsOpen)
  const toggleNotifications = useUIStore((state) => state.toggleNotifications)
  const setNotificationsOpen = useUIStore((state) => state.setNotificationsOpen)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onNotificationsClick={toggleNotifications} />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-6">{children}</div>
          {notificationsOpen && <NotificationPanel onClose={() => setNotificationsOpen(false)} />}
        </main>
      </div>
    </div>
  )
}
