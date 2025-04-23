"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";

import { useCartStore } from "@/store/cartStore";
import { useQueryClient } from "@tanstack/react-query";

export function useRealTimeCart(restaurantId: string, tableId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUserCarts, setOtherUserCarts] = useState<Record<string, any>>({});
  const [lastOrderUpdate, setLastOrderUpdate] = useState<any>(null);

  const { cart, markItemsAsSubmitted } = useCartStore();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Function to fetch latest orders by invalidating the query
  const fetchLatestOrders = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["tableData", restaurantId, tableId],
    });
  }, [queryClient, restaurantId, tableId]);

  // Initialize socket connection
  useEffect(() => {
    // Initialize the socket
    const socketInit = async () => {
      // Make sure the socket server is running
      await fetch("/api/socket");

      const socketInstance = io({
        path: "/api/socket",
        addTrailingSlash: false,
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);

        // Join the table room
        socketInstance.emit("join-table", { restaurantId, tableId });

        // Fetch latest data when connected
        fetchLatestOrders();
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketInstance.on("cart-updated", (data) => {
        console.log("Received cart update:", data);

        // Update other users' carts
        if (
          data.userId &&
          data.userId !== session?.user?.id &&
          data.userId !== localStorage.getItem("customerUserId")
        ) {
          setOtherUserCarts((prev) => ({
            ...prev,
            [data.userId]: {
              cart: data.cart,
              userName: data.userName || "Anonymous",
            },
          }));
        }
      });

      socketInstance.on("order-submitted", (data) => {
        console.log("Order submitted by another user:", data);
        setLastOrderUpdate(data);

        // Fetch latest data to sync with server
        fetchLatestOrders();
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    };

    socketInit();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [restaurantId, tableId, fetchLatestOrders, session?.user?.id, socket]);

  // Broadcast cart updates when our cart changes
  useEffect(() => {
    if (socket && isConnected) {
      const filteredCart = cart.filter(
        (item) => item.restaurantId === restaurantId && item.tableId === tableId
      );

      socket.emit("cart-update", {
        restaurantId,
        tableId,
        cart: filteredCart,
        userId: session?.user?.id || localStorage.getItem("customerUserId"),
        userName:
          session?.user?.name ||
          localStorage.getItem("customerName") ||
          "Anonymous",
      });
    }
  }, [cart, socket, isConnected, restaurantId, tableId, session]);

  // Function to notify others when an order is submitted
  const notifyOrderSubmitted = useCallback(
    (order: any) => {
      if (socket && isConnected) {
        // Mark items as submitted in the local cart
        if (order.id) {
          markItemsAsSubmitted(restaurantId, tableId, order.id);
        }

        // Emit the order submitted event
        socket.emit("order-submitted", {
          restaurantId,
          tableId,
          order,
          userId: session?.user?.id || localStorage.getItem("customerUserId"),
          userName:
            session?.user?.name ||
            localStorage.getItem("customerName") ||
            "Anonymous",
        });

        // Invalidate the query to refresh data
        fetchLatestOrders();
      }
    },
    [
      socket,
      isConnected,
      restaurantId,
      tableId,
      markItemsAsSubmitted,
      fetchLatestOrders,
      session,
    ]
  );

  return {
    isConnected,
    otherUserCarts,
    lastOrderUpdate,
    notifyOrderSubmitted,
    fetchLatestOrders,
  };
}
