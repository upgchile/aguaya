"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function liquidatePayment(paymentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("payments")
    .update({ status: "pagado", paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .eq("status", "pendiente");

  if (error) return { error: error.message };

  revalidatePath("/admin/pagos");
  return { success: true };
}

export async function liquidateAllPayments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: pending } = await supabase
    .from("payments")
    .select("id")
    .eq("status", "pendiente");

  if (!pending || pending.length === 0) {
    return { error: "No hay pagos pendientes" };
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "pagado", paid_at: new Date().toISOString() })
    .eq("status", "pendiente");

  if (error) return { error: error.message };

  revalidatePath("/admin/pagos");
  return { success: true, count: pending.length };
}

export async function updatePlatformConfig(key: string, value: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("platform_config")
    .update({ value })
    .eq("key", key);

  if (error) return { error: error.message };

  revalidatePath("/admin/comisiones");
  return { success: true };
}
