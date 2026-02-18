"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Repartidor } from "@/lib/types";
import { useAuth } from "./use-auth";

export function useRepartidor() {
  const { user } = useAuth();
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchRepartidor() {
      const { data, error: err } = await supabase
        .from("repartidores")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (err) {
        setError(err.message);
      } else {
        setRepartidor(data as Repartidor);
      }
      setLoading(false);
    }

    fetchRepartidor();

    // Realtime subscription for status changes
    const channel = supabase
      .channel("repartidor-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "repartidores",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setRepartidor(payload.new as Repartidor);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { repartidor, loading, error };
}
