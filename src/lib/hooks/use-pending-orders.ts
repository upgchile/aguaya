"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";

export function usePendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchOrders() {
      const { data, error: err } = await supabase
        .from("orders")
        .select("*, cliente:profiles!orders_cliente_id_fkey(*)")
        .eq("status", "pendiente")
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setOrders((data as Order[]) ?? []);
      }
      setLoading(false);
    }

    fetchOrders();

    // Realtime: listen for new pending orders and status changes
    const channel = supabase
      .channel("pending-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: "status=eq.pendiente",
        },
        () => {
          // Refetch on any change to pending orders
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // Remove orders that are no longer pending
          if (payload.new && (payload.new as Order).status !== "pendiente") {
            setOrders((prev) =>
              prev.filter((o) => o.id !== (payload.new as Order).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders, loading, error };
}
