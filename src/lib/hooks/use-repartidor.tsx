"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Repartidor } from "@/lib/types";
import { useAuth } from "./use-auth";

interface RepartidorContextValue {
  repartidor: Repartidor | null;
  setRepartidor: (r: Repartidor | null) => void;
  loading: boolean;
  error: string | null;
}

const RepartidorContext = createContext<RepartidorContextValue | null>(null);

export function RepartidorProvider({ children }: { children: ReactNode }) {
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

  return (
    <RepartidorContext.Provider
      value={{ repartidor, setRepartidor, loading, error }}
    >
      {children}
    </RepartidorContext.Provider>
  );
}

export function useRepartidor() {
  const ctx = useContext(RepartidorContext);
  if (!ctx) {
    throw new Error("useRepartidor must be used within a RepartidorProvider");
  }
  return ctx;
}
