import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      SELECT * FROM tables
      WHERE id = ${id}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ table: result[0] })
  } catch (error) {
    console.error("Error fetching table:", error)
    return NextResponse.json({ error: "Failed to fetch table" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { restaurantId, tableNumber, capacity, isActive } = await request.json()
    const id = params.id

    const result = await sql`
      UPDATE tables
      SET 
        restaurant_id = ${restaurantId},
        table_number = ${tableNumber},
        capacity = ${capacity},
        is_active = ${isActive}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ table: result[0] })
  } catch (error) {
    console.error("Error updating table:", error)
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM tables
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting table:", error)
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}

