import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get("restaurantId")

  try {
    let query = `SELECT * FROM tables`

    if (restaurantId) {
      query += ` WHERE restaurant_id = $1 ORDER BY table_number`
      const result = await sql.query(query, [restaurantId])
      return NextResponse.json({ tables: result.rows })
    } else {
      query += ` ORDER BY restaurant_id, table_number`
      const result = await sql.query(query)
      return NextResponse.json({ tables: result.rows })
    }
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { restaurantId, tableNumber, capacity, isActive } = await request.json()

    const result = await sql`
      INSERT INTO tables (restaurant_id, table_number, capacity, is_active)
      VALUES (${restaurantId}, ${tableNumber}, ${capacity}, ${isActive})
      RETURNING *
    `

    return NextResponse.json({ table: result[0] })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 })
  }
}

