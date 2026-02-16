"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  User,
  Clock,
  Package,
  Truck,
  Navigation,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PRECIO_BIDON,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/types";
import type { OrderStatus } from "@/lib/types";
import { mockOrders, mockRepartidorProfile } from "@/lib/mock-data";

const STEPPER_STATUSES = [
  "pendiente",
  "asignado",
  "en_camino",
  "entregado",
] as const;

type StepperStatus = (typeof STEPPER_STATUSES)[number];

const STEPPER_ICONS: Record<StepperStatus, typeof CheckCircle2> = {
  pendiente: CheckCircle2,
  asignado: Package,
  en_camino: Truck,
  entregado: CheckCircle2,
};

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export default function TrackingPage() {
  // Get active (in-progress) order from mock data
  const activeOrder =
    mockOrders.find(
      (o) =>
        o.status === "en_camino" ||
        o.status === "asignado" ||
        o.status === "pendiente"
    ) ?? mockOrders[0];

  const currentStepIdx = STEPPER_STATUSES.indexOf(
    activeOrder.status as StepperStatus
  );
  const repartidor = mockRepartidorProfile;

  return (
    <div className="px-4 pt-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <h1 className="text-xl font-bold text-foreground">Tu Pedido</h1>
        <p className="text-sm text-muted-foreground">
          Pedido #{activeOrder.id}
        </p>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md">
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              {STEPPER_STATUSES.map((status, idx) => {
                const Icon = STEPPER_ICONS[status];
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isUpcoming = idx > currentStepIdx;

                return (
                  <div key={status} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.15 : 1,
                          backgroundColor: isUpcoming
                            ? "var(--color-muted)"
                            : "var(--color-primary)",
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`flex size-10 items-center justify-center rounded-full ${
                          isCurrent ? "ring-4 ring-primary/20" : ""
                        }`}
                      >
                        <Icon
                          className={`size-5 ${
                            isUpcoming
                              ? "text-muted-foreground"
                              : "text-primary-foreground"
                          }`}
                        />
                      </motion.div>
                      <span
                        className={`text-[10px] font-medium leading-tight text-center ${
                          isCurrent
                            ? "text-primary"
                            : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </span>
                    </div>
                    {idx < STEPPER_STATUSES.length - 1 && (
                      <div className="mx-1 mb-5 h-0.5 flex-1">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: idx < currentStepIdx ? 1 : 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.15 }}
                          className="h-full origin-left rounded-full bg-primary"
                        />
                        <div
                          className={`-mt-0.5 h-0.5 rounded-full ${
                            idx < currentStepIdx ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ETA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-4"
      >
        <Card className="border-0 bg-primary/5 shadow-sm">
          <CardContent className="flex items-center gap-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Clock className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Llegada estimada
              </p>
              <p className="text-xl font-bold text-primary">12 minutos</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Repartidor Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-4"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="py-2">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <User className="size-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {repartidor.user?.name ?? "Carlos M."}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">
                    {repartidor.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({repartidor.total_entregas} entregas)
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                className="size-10 rounded-full bg-green-500 hover:bg-green-600"
              >
                <Phone className="size-4 text-white" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-4"
      >
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-muted/60 border border-dashed border-border">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Navigation className="size-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Mapa en vivo
          </p>
          <p className="text-xs text-muted-foreground">proximamente</p>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mt-3"
          >
            <MapPin className="size-6 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-6 mt-4"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="space-y-3 py-2">
            <h3 className="font-semibold text-foreground">
              Detalle del Pedido
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bidones</span>
                <span className="font-medium text-foreground">
                  {activeOrder.cantidad_bidones} x{" "}
                  {formatCLP(PRECIO_BIDON)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCLP(activeOrder.total)}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {activeOrder.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={ORDER_STATUS_COLORS[activeOrder.status]}>
                  {ORDER_STATUS_LABELS[activeOrder.status]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
