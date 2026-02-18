"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types";

interface AuthState {
  user: SupabaseUser | null;
  role: UserRole;
  name: string;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: "cliente",
    name: "",
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setState({
          user,
          role: (user.user_metadata?.role as UserRole) || "cliente",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "",
          loading: false,
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState({
        user,
        role: (user?.user_metadata?.role as UserRole) || "cliente",
        name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
