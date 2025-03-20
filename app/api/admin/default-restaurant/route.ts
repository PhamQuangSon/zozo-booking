import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM restaurant_config WHERE is_default = true LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ restaurant: null })
    }

    return NextResponse.json({ restaurant: result[0] })
  } catch (error) {
    console.error("Error fetching default restaurant:", error)
    return NextResponse.json({ error: "Failed to fetch default restaurant" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { restaurant } = await request.json()

    // First, set all restaurants as non-default
    await sql`
      UPDATE restaurant_config SET is_default = false
    `

    // Then set the selected restaurant as default
    // If the restaurant doesn't exist, create it
    const result = await sql`
      INSERT INTO restaurant_config (id, name, address, phone, is_default)
      VALUES (${restaurant.id}, ${restaurant.name}, ${restaurant.address}, ${restaurant.phone}, true)
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = ${restaurant.name}, 
        address = ${restaurant.address}, 
        phone = ${restaurant.phone}, 
        is_default = true
      RETURNING *
    `

    return NextResponse.json({ restaurant: result[0] })
  } catch (error) {
    console.error("Error saving default restaurant:", error)
    return NextResponse.json({ error: "Failed to save default restaurant" }, { status: 500 })
  }
}

