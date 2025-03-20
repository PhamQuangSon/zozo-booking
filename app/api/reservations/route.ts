import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const restaurantId = searchParams.get("restaurantId")

  try {
    let query = `SELECT * FROM reservations`
    const params = []
    let paramIndex = 1

    if (date || restaurantId) {
      query += ` WHERE`

      if (date) {
        query += ` reservation_date = $${paramIndex}`
        params.push(date)
        paramIndex++
      }

      if (date && restaurantId) {
        query += ` AND`
      }

      if (restaurantId) {
        query += ` restaurant_id = $${paramIndex}`
        params.push(restaurantId)
      }
    }

    query += ` ORDER BY reservation_date, reservation_time`

    const result = await sql.query(query, params)
    return NextResponse.json({ reservations: result.rows })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, date, time, guests, restaurantId, tableId } = await request.json()

    const result = await sql`
      INSERT INTO reservations (
        name, email, phone, reservation_date, reservation_time, 
        guests, restaurant_id, table_id, status
      )
      VALUES (
        ${name}, ${email}, ${phone}, ${date}, ${time}, 
        ${guests}, ${restaurantId}, ${tableId || null}, 'pending'
      )
      RETURNING *
    `

    return NextResponse.json({ reservation: result[0] })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}

