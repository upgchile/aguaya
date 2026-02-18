"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";

interface AdminStats {
  todayOrders: number;
  todayRevenue: number;
  activeRepartidores: number;
  deliveryRate: number;
  recentOrders: Order[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    todayOrders: 0,
    todayRevenue: 0,
    activeRepartidores: 0,
    deliveryRate: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchStats() {
      // Get stats from RPC
      const { data: rpcData, error: rpcErr } =
        await supabase.rpc("get_admin_stats");

      if (rpcErr) {
        setError(rpcErr.message);
        setLoading(false);
        return;
      }

      const rpcStats = rpcData as {
        today_orders: number;
        today_revenue: number;
        active_repartidores: number;
        delivery_rate: number;
      };

      // Get recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*, cliente:profiles!orders_cliente_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        todayOrders: rpcStats.today_orders,
        todayRevenue: rpcStats.today_revenue,
        activeRepartidores: rpcStats.active_repartidores,
        deliveryRate: rpcStats.delivery_rate,
        recentOrders: (orders as Order[]) ?? [],
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return { ...stats, loading, error };
}
