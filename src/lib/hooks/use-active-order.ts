"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";

export function useActiveOrder(repartidorId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repartidorId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchOrder() {
      const { data, error: err } = await supabase
        .from("orders")
        .select("*, cliente:profiles!orders_cliente_id_fkey(*)")
        .eq("repartidor_id", repartidorId!)
        .in("status", ["asignado", "en_camino"])
        .order("accepted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (err) {
        setError(err.message);
      } else {
        setOrder(data as Order | null);
      }
      setLoading(false);
    }

    fetchOrder();

    // Realtime: listen for updates on orders assigned to this repartidor
    const channel = supabase
      .channel("active-order")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `repartidor_id=eq.${repartidorId}`,
        },
        (payload) => {
          const updated = payload.new as Order;
          if (
            updated.status === "asignado" ||
            updated.status === "en_camino"
          ) {
            // Refetch to get the joined client data
            fetchOrder();
          } else {
            // Order completed or cancelled
            setOrder(null);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `repartidor_id=eq.${repartidorId}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [repartidorId]);

  return { order, loading, error };
}
