/**
 * NOTE BY ID API ROUTE
 * 
 * GET /api/notes/:id - Get note
 * PUT /api/notes/:id - Update note
 * DELETE /api/notes/:id - Delete note
 * 
 * TODO: Connect to database
 * TODO: Add authentication
 */

import { NextRequest, NextResponse } from "next/server"
import type { Note } from "@/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Query database for note by ID
    // const note = await noteService.getById(id)
    
    return NextResponse.json(
      { error: "Note not found" },
      { status: 404 }
    )
  } catch (error) {
    console.error("Error fetching note:", error)
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // TODO: Update note in database
    // const note = await noteService.update(id, body)
    
    return NextResponse.json(
      { error: "Note not found" },
      { status: 404 }
    )
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Delete note from database
    // await noteService.delete(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    )
  }
}






