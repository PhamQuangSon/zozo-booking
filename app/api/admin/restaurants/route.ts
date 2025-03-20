import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const result = await sql`
      SELECT id, name, address, phone FROM restaurant_config
      ORDER BY is_default DESC, name
    `

    return NextResponse.json({ restaurants: result })
  } catch (error) {
    console.error("Error fetching restaurants:", error)

    // Return mock data if database query fails
    return NextResponse.json({
      restaurants: [
        { id: "rest1", name: "Main Restaurant" },
        { id: "rest2", name: "Downtown Branch" },
      ],
    })
  }
}

export async function POST(request: Request) {
  try {
    const { id, name, address, phone, isDefault } = await request.json()

    // If this restaurant is set as default, first set all others to non-default
    if (isDefault) {
      await sql`
        UPDATE restaurant_config SET is_default = false
      `
    }

    const result = await sql`
      INSERT INTO restaurant_config (id, name, address, phone, is_default)
      VALUES (${id}, ${name}, ${address}, ${phone}, ${isDefault || false})
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = ${name}, 
        address = ${address}, 
        phone = ${phone}, 
        is_default = ${isDefault || false}
      RETURNING *
    `

    return NextResponse.json({ restaurant: result[0] })
  } catch (error) {
    console.error("Error creating/updating restaurant:", error)
    return NextResponse.json({ error: "Failed to create/update restaurant" }, { status: 500 })
  }
}

