import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const id = params.id

    const result = await sql`
      UPDATE reservations
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json({ reservation: result[0] })
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM reservations
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 })
  }
}

