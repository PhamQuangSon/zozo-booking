"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useCartStore } from "@/store/cartStore"
import { useSession } from "next-auth/react"

export function useRealTimeCart(restaurantId: string, tableId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [otherUserCarts, setOtherUserCarts] = useState<Record<string, any>>({})

  const { cart, syncServerOrders } = useCartStore()
  const { data: session } = useSession()

  // Initialize socket connection
  useEffect(() => {
    // Initialize the socket
    const socketInit = async () => {
      // Make sure the socket server is running
      await fetch("/api/socket")

      const socketInstance = io({
        path: "/api/socket",
        addTrailingSlash: false,
      })

      socketInstance.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)

        // Join the table room
        socketInstance.emit("join-table", { restaurantId, tableId })
      })

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      socketInstance.on("cart-updated", (data) => {
        console.log("Received cart update:", data)

        // Update other users' carts
        if (data.userId && data.userId !== session?.user?.id) {
          setOtherUserCarts((prev) => ({
            ...prev,
            [data.userId]: {
              cart: data.cart,
              userName: data.userName || "Anonymous",
            },
          }))
        }
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }

    socketInit()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [restaurantId, tableId])

  // Broadcast cart updates when our cart changes
  useEffect(() => {
    if (socket && isConnected) {
      const filteredCart = cart.filter((item) => item.restaurantId === restaurantId && item.tableId === tableId)

      socket.emit("cart-update", {
        restaurantId,
        tableId,
        cart: filteredCart,
        userId: session?.user?.id,
        userName: session?.user?.name,
      })
    }
  }, [cart, socket, isConnected, restaurantId, tableId, session])

  return {
    isConnected,
    otherUserCarts,
  }
}
