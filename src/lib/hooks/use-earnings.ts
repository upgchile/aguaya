"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";

interface EarningsData {
  today: number;
  week: number;
  month: number;
  todayDeliveries: number;
  weekDeliveries: number;
  monthDeliveries: number;
  recentOrders: Order[];
  pagoRepartidor: number;
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
    pagoRepartidor: 3000,
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

      // Get payments with order details for this repartidor this month
      const { data: payments, error: payErr } = await supabase
        .from("payments")
        .select("monto_neto, created_at, order:orders(cantidad_bidones, delivered_at)")
        .eq("repartidor_id", repartidorId!)
        .gte("created_at", monthStart)
        .order("created_at", { ascending: false });

      if (payErr) {
        setError(payErr.message);
        setLoading(false);
        return;
      }

      // Get delivered orders for the recent list
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("repartidor_id", repartidorId!)
        .eq("status", "entregado")
        .gte("delivered_at", monthStart)
        .order("delivered_at", { ascending: false })
        .limit(5);

      // Get pago_repartidor from platform_config
      const { data: configRow } = await supabase
        .from("platform_config")
        .select("value")
        .eq("key", "pago_repartidor")
        .single();

      const pagoRepartidor = configRow ? Number(configRow.value) : 3000;

      const allPayments = payments ?? [];

      const todayPayments = allPayments.filter(
        (p) => p.created_at >= todayStart
      );
      const weekPayments = allPayments.filter(
        (p) => p.created_at >= weekStart
      );

      const sumEarnings = (list: typeof allPayments) =>
        list.reduce((sum, p) => sum + p.monto_neto, 0);

      setData({
        today: sumEarnings(todayPayments),
        week: sumEarnings(weekPayments),
        month: sumEarnings(allPayments),
        todayDeliveries: todayPayments.length,
        weekDeliveries: weekPayments.length,
        monthDeliveries: allPayments.length,
        recentOrders: (orders as Order[]) ?? [],
        pagoRepartidor,
      });
      setLoading(false);
    }

    fetchEarnings();
  }, [repartidorId]);

  return { ...data, loading, error };
}
