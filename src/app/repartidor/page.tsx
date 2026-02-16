"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Droplets,
  ChevronRight,
  Inbox,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockOrders } from "@/lib/mock-data";
import { PAGO_REPARTIDOR, Order } from "@/lib/types";
import { toast } from "sonner";

const mockDistances: Record<string, string> = {
  "ord-001": "0.8 km",
  "ord-002": "1.2 km",
  "ord-003": "2.1 km",
  "ord-004": "0.5 km",
};

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export default function PedidosCercanosPage() {
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status === "pendiente")
  );
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleAccept = (orderId: string) => {
    setAcceptingId(orderId);

    setTimeout(() => {
      setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
      setAcceptingId(null);
      toast.success("Pedido aceptado", {
        description: "Dirígete al punto de recogida.",
      });
      setTimeout(() => {
        router.push("/repartidor/activo");
      }, 800);
    }, 600);
  };

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-foreground">
            Pedidos Cercanos
          </h1>
          {pendingOrders.length > 0 && (
            <Badge className="bg-primary text-primary-foreground text-xs tabular-nums">
              {pendingOrders.length}
            </Badge>
          )}
        </div>
        {pendingOrders.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="relative">
              <Bell className="size-5 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500 animate-ping" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Order Cards */}
      <AnimatePresence mode="popLayout">
        {pendingOrders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pendingOrders.map((order, index) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: 300,
                  scale: 0.8,
                  transition: { duration: 0.4, ease: "easeIn" },
                }}
                transition={{
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              >
                <Card className="overflow-hidden border-border/60 py-0 shadow-sm transition-shadow hover:shadow-md">
                  {/* New order accent bar */}
                  <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Order info */}
                      <div className="flex-1 space-y-3">
                        {/* Address */}
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                          <div>
                            <p className="text-sm font-medium leading-tight text-foreground">
                              {order.address}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <Navigation className="size-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {mockDistances[order.id] || "1.0 km"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details row */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1">
                            <Droplets className="size-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary">
                              {order.cantidad_bidones}{" "}
                              {order.cantidad_bidones === 1
                                ? "bidón"
                                : "bidones"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-base font-bold text-green-600">
                              {formatCLP(
                                PAGO_REPARTIDOR * order.cantidad_bidones
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Accept button */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md shadow-green-600/20 transition-all active:scale-95"
                          onClick={() => handleAccept(order.id)}
                          disabled={acceptingId === order.id}
                        >
                          {acceptingId === order.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                ease: "linear",
                              }}
                              className="size-4 rounded-full border-2 border-white border-t-transparent"
                            />
                          ) : (
                            <>
                              Aceptar
                              <ChevronRight className="size-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-9 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No hay pedidos disponibles
            </h3>
            <p className="max-w-[260px] text-sm text-muted-foreground leading-relaxed">
              Mantente disponible para recibir nuevos pedidos.
            </p>
            <motion.div
              className="mt-6 flex items-center gap-2 rounded-full bg-green-50 px-4 py-2"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <span className="size-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">
                Escuchando pedidos...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
