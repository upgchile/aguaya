"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleRepartidorStatus(
  newStatus: "disponible" | "offline"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("repartidores")
    .update({ status: newStatus })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/repartidor");
  return { success: true };
}
