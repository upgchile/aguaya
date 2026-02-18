"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";

export function usePendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
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
  }, []);

  useEffect(() => {
    fetchOrders();

    const supabase = createClient();

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
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
