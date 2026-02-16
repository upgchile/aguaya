export type UserRole = "cliente" | "repartidor" | "admin";

export type OrderStatus =
  | "pendiente"
  | "asignado"
  | "en_camino"
  | "entregado"
  | "cancelado";

export type RepartidorStatus = "disponible" | "ocupado" | "offline";

export type PaymentStatus = "pendiente" | "pagado";

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Repartidor {
  id: string;
  user_id: string;
  status: RepartidorStatus;
  lat: number;
  lng: number;
  rating: number;
  total_entregas: number;
  user?: User;
}

export interface Order {
  id: string;
  cliente_id: string;
  repartidor_id?: string;
  cantidad_bidones: number;
  precio_unitario: number;
  total: number;
  comision_plataforma: number;
  address: string;
  lat: number;
  lng: number;
  status: OrderStatus;
  scheduled_at?: string;
  accepted_at?: string;
  delivered_at?: string;
  created_at: string;
  cliente?: User;
  repartidor?: Repartidor;
}

export interface Payment {
  id: string;
  repartidor_id: string;
  order_id: string;
  monto_bruto: number;
  comision: number;
  monto_neto: number;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
  repartidor?: Repartidor;
  order?: Order;
}

export interface PlatformConfig {
  precio_bidon: number;
  comision_porcentaje: number;
  comision_fija: number;
}

// Demo/mock data constants
export const PRECIO_BIDON = 4500;
export const COMISION_PLATAFORMA = 500;
export const PAGO_REPARTIDOR = 3000;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  asignado: "Asignado",
  en_camino: "En Camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  asignado: "bg-blue-100 text-blue-800",
  en_camino: "bg-purple-100 text-purple-800",
  entregado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};
