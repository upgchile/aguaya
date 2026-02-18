"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  cantidad_bidones: number;
  address: string;
  lat?: number;
  lng?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const precio_unitario = 4500;
  const comision_plataforma = 500;
  const total = data.cantidad_bidones * precio_unitario;

  const { error } = await supabase.from("orders").insert({
    cliente_id: user.id,
    cantidad_bidones: data.cantidad_bidones,
    precio_unitario,
    total,
    comision_plataforma,
    address: data.address,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/cliente");
  return { success: true };
}

export async function acceptOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  // Get repartidor id for this user
  const { data: repartidor } = await supabase
    .from("repartidores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!repartidor) return { error: "No eres repartidor" };

  const { data, error } = await supabase.rpc("accept_order", {
    p_order_id: orderId,
    p_repartidor_id: repartidor.id,
  });

  if (error) return { error: error.message };

  const result = data as { success: boolean; error?: string };
  if (!result.success) return { error: result.error };

  revalidatePath("/repartidor");
  return { success: true };
}

export async function advanceOrderStatus(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: repartidor } = await supabase
    .from("repartidores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!repartidor) return { error: "No eres repartidor" };

  const { data, error } = await supabase.rpc("advance_order_status", {
    p_order_id: orderId,
    p_repartidor_id: repartidor.id,
  });

  if (error) return { error: error.message };

  const result = data as { success: boolean; error?: string; new_status?: string };
  if (!result.success) return { error: result.error };

  revalidatePath("/repartidor");
  return { success: true, new_status: result.new_status };
}

export async function rateOrder(orderId: string, rating: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase.rpc("rate_order", {
    p_order_id: orderId,
    p_rating: rating,
  });

  if (error) return { error: error.message };

  const result = data as { success: boolean; error?: string };
  if (!result.success) return { error: result.error };

  revalidatePath("/cliente");
  return { success: true };
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelado" })
    .eq("id", orderId)
    .eq("cliente_id", user.id)
    .eq("status", "pendiente");

  if (error) return { error: error.message };

  revalidatePath("/cliente");
  return { success: true };
}
