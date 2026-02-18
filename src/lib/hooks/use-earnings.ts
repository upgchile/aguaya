"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PAGO_REPARTIDOR } from "@/lib/types";
import type { Order } from "@/lib/types";

interface EarningsData {
  today: number;
  week: number;
  month: number;
  todayDeliveries: number;
  weekDeliveries: number;
  monthDeliveries: number;
  recentOrders: Order[];
}

export function useEarnings(repartidorId: string | undefined) {
  const [data, setData] = useState<EarningsData>({
    today: 0,
    week: 0,
    month: 0,
    todayDeliveries: 0,
    weekDeliveries: 0,
    monthDeliveries: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repartidorId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchEarnings() {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).toISOString();

      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      ).toISOString();

      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();

      // Get all delivered orders for this repartidor this month
      const { data: orders, error: err } = await supabase
        .from("orders")
        .select("*")
        .eq("repartidor_id", repartidorId!)
        .eq("status", "entregado")
        .gte("delivered_at", monthStart)
        .order("delivered_at", { ascending: false });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const allOrders = (orders as Order[]) ?? [];

      const todayOrders = allOrders.filter(
        (o) => o.delivered_at && o.delivered_at >= todayStart
      );
      const weekOrders = allOrders.filter(
        (o) => o.delivered_at && o.delivered_at >= weekStart
      );

      const calcEarnings = (list: Order[]) =>
        list.reduce((sum, o) => sum + PAGO_REPARTIDOR * o.cantidad_bidones, 0);

      setData({
        today: calcEarnings(todayOrders),
        week: calcEarnings(weekOrders),
        month: calcEarnings(allOrders),
        todayDeliveries: todayOrders.length,
        weekDeliveries: weekOrders.length,
        monthDeliveries: allOrders.length,
        recentOrders: allOrders.slice(0, 5),
      });
      setLoading(false);
    }

    fetchEarnings();
  }, [repartidorId]);

  return { ...data, loading, error };
}
