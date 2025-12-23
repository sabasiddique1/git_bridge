"use client"

import { X, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface NotificationPanelProps {
  onClose: () => void
}

const notifications = [
  {
    id: "1",
    title: "Review requested",
    description: "@gaearon requested your review on PR #4521",
    time: "5 min ago",
    unread: true,
  },
  {
    id: "2",
    title: "PR merged",
    description: "Your PR 'fix: hydration mismatch' was merged",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    title: "New comment",
    description: "@adamwathan commented on your issue",
    time: "3 hours ago",
    unread: true,
  },
  {
    id: "4",
    title: "CI passed",
    description: "All checks passed on vercel/next.js #45123",
    time: "5 hours ago",
    unread: false,
  },
]

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">Notifications</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <CheckCheck className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "group flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-secondary cursor-pointer",
                notification.unread && "bg-secondary/50",
              )}
            >
              {notification.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
              {!notification.unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0" />}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Button variant="ghost" className="w-full text-muted-foreground text-sm">
          View all notifications
        </Button>
      </div>
    </div>
  )
}
