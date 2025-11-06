import { Server } from "socket.io";

import { successResponse } from "@/lib/apiResponse";

// Global variable to store the Socket.IO server instance
let io: Server;

export async function GET() {
  const { NextResponse } = await import("next/server");

  // If the Socket.IO server is already running, return early
  if (io) {
    return NextResponse.json(
      successResponse({
        success: true,
        message: "Socket server already running",
      })
    );
  }
  // Create a new Socket.IO server
  io = new Server({
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle joining a table room
    socket.on("join-table", ({ restaurantId, tableId }) => {
      const roomId = `restaurant:${restaurantId}:table:${tableId}`;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle cart updates
    socket.on("cart-update", (data) => {
      const { restaurantId, tableId } = data;
      const roomId = `restaurant:${restaurantId}:table:${tableId}`;

      // Broadcast the cart update to all clients in the room except the sender
      socket.to(roomId).emit("cart-updated", data);
    });

    // Handle order submissions
    socket.on("order-submitted", (data) => {
      const { restaurantId, tableId, order } = data;
      const roomId = `restaurant:${restaurantId}:table:${tableId}`;

      // Broadcast the order submission to all clients in the room including the sender
      io.to(roomId).emit("order-update", { type: "new", order });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return NextResponse.json(
    successResponse({
      success: true,
      message: "Socket server started",
    })
  );
}
