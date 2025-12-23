/**
 * NOTES API ROUTE
 * 
 * GET /api/notes - List notes
 * POST /api/notes - Create note
 * 
 * TODO: Connect to database
 * TODO: Add authentication
 * TODO: Implement markdown processing
 */

import { NextRequest, NextResponse } from "next/server"
import type { Note } from "@/types"

export async function GET(request: NextRequest) {
  try {
    // TODO: Query database for notes
    // const notes = await noteService.list()
    
    // Placeholder: Return empty array for now
    const notes: Note[] = []

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: Validate note data
    // TODO: Create note in database
    // const note = await noteService.create(body)
    
    // Placeholder: Return created note
    const note: Note = {
      id: `note-${Date.now()}`,
      title: body.title || "New Note",
      content: body.content || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      linkedEventIds: body.linkedEventIds || [],
      linkedPrNumbers: body.linkedPrNumbers || [],
      linkedIssueNumbers: body.linkedIssueNumbers || [],
    }

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}





