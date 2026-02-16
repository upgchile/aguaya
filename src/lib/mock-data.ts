import { Order, Repartidor, User, Payment } from "./types";

// Mock users
export const mockCliente: User = {
  id: "c1",
  email: "maria@example.com",
  phone: "+56912345678",
  name: "María González",
  role: "cliente",
  created_at: "2026-02-01T10:00:00Z",
};

export const mockRepartidor: User = {
  id: "r1",
  email: "carlos@example.com",
  phone: "+56987654321",
  name: "Carlos Muñoz",
  role: "repartidor",
  created_at: "2026-01-15T10:00:00Z",
};

export const mockAdmin: User = {
  id: "a1",
  email: "admin@aguaya.cl",
  phone: "+56911111111",
  name: "Admin Aguaya",
  role: "admin",
  created_at: "2026-01-01T10:00:00Z",
};

export const mockRepartidorProfile: Repartidor = {
  id: "rp1",
  user_id: "r1",
  status: "disponible",
  lat: -33.4489,
  lng: -70.6693,
  rating: 4.8,
  total_entregas: 156,
  user: mockRepartidor,
};

export const mockOrders: Order[] = [
  {
    id: "ord-001",
    cliente_id: "c1",
    repartidor_id: "r1",
    cantidad_bidones: 2,
    precio_unitario: 4500,
    total: 9000,
    comision_plataforma: 1000,
    address: "Av. Providencia 1234, Providencia",
    lat: -33.4321,
    lng: -70.6123,
    status: "entregado",
    accepted_at: "2026-02-16T10:05:00Z",
    delivered_at: "2026-02-16T10:25:00Z",
    created_at: "2026-02-16T10:00:00Z",
    cliente: mockCliente,
  },
  {
    id: "ord-002",
    cliente_id: "c1",
    cantidad_bidones: 1,
    precio_unitario: 4500,
    total: 4500,
    comision_plataforma: 500,
    address: "Las Condes 9876, Las Condes",
    lat: -33.41,
    lng: -70.58,
    status: "pendiente",
    created_at: "2026-02-16T14:00:00Z",
    cliente: mockCliente,
  },
  {
    id: "ord-003",
    cliente_id: "c1",
    repartidor_id: "r1",
    cantidad_bidones: 3,
    precio_unitario: 4500,
    total: 13500,
    comision_plataforma: 1500,
    address: "Ñuñoa 567, Ñuñoa",
    lat: -33.45,
    lng: -70.6,
    status: "en_camino",
    accepted_at: "2026-02-16T13:50:00Z",
    created_at: "2026-02-16T13:45:00Z",
    cliente: mockCliente,
  },
  {
    id: "ord-004",
    cliente_id: "c1",
    repartidor_id: "r1",
    cantidad_bidones: 1,
    precio_unitario: 4500,
    total: 4500,
    comision_plataforma: 500,
    address: "Vitacura 2345, Vitacura",
    lat: -33.39,
    lng: -70.6,
    status: "entregado",
    accepted_at: "2026-02-15T11:05:00Z",
    delivered_at: "2026-02-15T11:30:00Z",
    created_at: "2026-02-15T11:00:00Z",
    cliente: mockCliente,
  },
];

export const mockPayments: Payment[] = [
  {
    id: "pay-001",
    repartidor_id: "r1",
    order_id: "ord-001",
    monto_bruto: 9000,
    comision: 1000,
    monto_neto: 6000,
    status: "pagado",
    paid_at: "2026-02-16T18:00:00Z",
    created_at: "2026-02-16T10:25:00Z",
  },
  {
    id: "pay-002",
    repartidor_id: "r1",
    order_id: "ord-004",
    monto_bruto: 4500,
    comision: 500,
    monto_neto: 3000,
    status: "pendiente",
    created_at: "2026-02-15T11:30:00Z",
  },
];

export const mockUsers: User[] = [
  mockCliente,
  mockRepartidor,
  mockAdmin,
  {
    id: "c2",
    email: "pedro@example.com",
    phone: "+56922222222",
    name: "Pedro Soto",
    role: "cliente",
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    id: "r2",
    email: "ana@example.com",
    phone: "+56933333333",
    name: "Ana Reyes",
    role: "repartidor",
    created_at: "2026-02-03T10:00:00Z",
  },
];
