"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";
import { useAuth } from "./use-auth";

export function useClientOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchOrders() {
      const { data, error: err } = await supabase
        .from("orders")
        .select(
          "*, repartidor:repartidores(*, user:profiles!repartidores_user_id_fkey(*))"
        )
        .eq("cliente_id", user!.id)
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setOrders((data as Order[]) ?? []);
      }
      setLoading(false);
    }

    fetchOrders();

    // Realtime: listen for changes on client's orders
    const channel = supabase
      .channel("client-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `cliente_id=eq.${user.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Active: in-progress orders OR delivered but not yet rated (so client can rate)
  const activeOrder = useMemo(
    () =>
      orders.find(
        (o) =>
          o.status === "pendiente" ||
          o.status === "asignado" ||
          o.status === "en_camino" ||
          (o.status === "entregado" && o.rating == null)
      ) ?? null,
    [orders]
  );

  const history = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "cancelado" ||
          (o.status === "entregado" && o.rating != null)
      ),
    [orders]
  );

  return { orders, activeOrder, history, loading, error };
}
