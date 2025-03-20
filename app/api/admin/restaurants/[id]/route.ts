import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      SELECT * FROM restaurant_config
      WHERE id = ${id}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json({ restaurant: result[0] })
  } catch (error) {
    console.error("Error fetching restaurant:", error)
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, address, phone, isDefault } = await request.json()
    const id = params.id

    // If this restaurant is set as default, first set all others to non-default
    if (isDefault) {
      await sql`
        UPDATE restaurant_config SET is_default = false
      `
    }

    const result = await sql`
      UPDATE restaurant_config
      SET 
        name = ${name},
        address = ${address},
        phone = ${phone},
        is_default = ${isDefault || false}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json({ restaurant: result[0] })
  } catch (error) {
    console.error("Error updating restaurant:", error)
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if this is the default restaurant
    const checkResult = await sql`
      SELECT is_default FROM restaurant_config
      WHERE id = ${id}
      LIMIT 1
    `

    if (checkResult.length > 0 && checkResult[0].is_default) {
      return NextResponse.json({ error: "Cannot delete the default restaurant" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM restaurant_config
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    return NextResponse.json({ error: "Failed to delete restaurant" }, { status: 500 })
  }
}

