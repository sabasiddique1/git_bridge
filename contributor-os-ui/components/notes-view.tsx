"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, Clock, MoreHorizontal, Tag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Note {
  id: string
  title: string
  excerpt: string
  tags: string[]
  linkedRepo?: string
  linkedPR?: string
  updatedAt: string
}

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Hydration mismatch investigation",
    excerpt:
      "The issue occurs when server-rendered HTML doesn't match the client-side React tree. Key findings: useId generates different values...",
    tags: ["debugging", "react"],
    linkedRepo: "vercel/next.js",
    linkedPR: "#45892",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "useOptimistic patterns",
    excerpt:
      "Notes on implementing optimistic updates with the new useOptimistic hook. Best practices and edge cases to consider...",
    tags: ["react", "hooks"],
    linkedRepo: "facebook/react",
    updatedAt: "1 day ago",
  },
  {
    id: "3",
    title: "Tailwind v4 migration checklist",
    excerpt:
      "Steps to migrate from Tailwind v3 to v4: 1. Update config format 2. Review deprecated utilities 3. Test responsive breakpoints...",
    tags: ["css", "migration"],
    linkedRepo: "tailwindlabs/tailwindcss",
    updatedAt: "3 days ago",
  },
  {
    id: "4",
    title: "RFC: Server Actions improvements",
    excerpt:
      "Proposal for improving Server Actions DX: better error handling, progressive enhancement support, and streaming responses...",
    tags: ["rfc", "next.js"],
    updatedAt: "1 week ago",
  },
]

const tagColors: Record<string, string> = {
  debugging: "bg-red-500/20 text-red-400",
  react: "bg-blue-500/20 text-blue-400",
  hooks: "bg-purple-500/20 text-purple-400",
  css: "bg-pink-500/20 text-pink-400",
  migration: "bg-yellow-500/20 text-yellow-400",
  rfc: "bg-green-500/20 text-green-400",
  "next.js": "bg-primary/20 text-primary",
}

export function NotesView() {
  const [search, setSearch] = useState("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(mockNotes[0])

  const filteredNotes = mockNotes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Notes List */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 overflow-auto">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={cn(
                "cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50",
                selectedNote?.id === note.id && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-medium text-foreground line-clamp-1">{note.title}</h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{note.excerpt}</p>
              <div className="mt-3 flex items-center gap-2">
                {note.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} className={cn("text-xs", tagColors[tag] || "bg-secondary")}>
                    {tag}
                  </Badge>
                ))}
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3" />
                  {note.updatedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      {selectedNote ? (
        <div className="flex-1 rounded-lg border border-border bg-card overflow-hidden flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">{selectedNote.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {selectedNote.linkedRepo && (
                  <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">{selectedNote.linkedRepo}</span>
                )}
                {selectedNote.linkedPR && (
                  <span className="font-mono text-xs bg-chart-1/20 text-chart-1 px-2 py-0.5 rounded">
                    {selectedNote.linkedPR}
                  </span>
                )}
                <span>•</span>
                <span>Updated {selectedNote.updatedAt}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Tag className="h-3.5 w-3.5" />
                Add tag
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Link to PR/Issue</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed">{selectedNote.excerpt}</p>
              <p className="text-muted-foreground mt-4">
                Click to start editing this note. Your notes are automatically saved and synced.
              </p>
            </div>
          </div>

          {/* Tags Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {selectedNote.tags.map((tag) => (
                <Badge key={tag} className={cn("text-xs cursor-pointer", tagColors[tag] || "bg-secondary")}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-border">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">Select a note to view</p>
          </div>
        </div>
      )}
    </div>
  )
}
