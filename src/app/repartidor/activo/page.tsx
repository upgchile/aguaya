"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  User,
  Droplets,
  Navigation,
  Clock,
  CheckCircle2,
  Flag,
  ChevronRight,
  Map,
  PackageCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRepartidor } from "@/lib/hooks/use-repartidor";
import { useActiveOrder } from "@/lib/hooks/use-active-order";
import { advanceOrderStatus } from "@/lib/actions/order-actions";
import {
  PAGO_REPARTIDOR,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/types";
import { toast } from "sonner";

const STEP_CONFIG: Record<
  string,
  { label: string; action: string; icon: React.ElementType; color: string }
> = {
  asignado: {
    label: "Dirígete al punto de recogida",
    action: "En camino al cliente",
    icon: Navigation,
    color: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
  },
  en_camino: {
    label: "En camino al cliente",
    action: "Llegué - Entrega completada",
    icon: Flag,
    color: "bg-green-600 hover:bg-green-700 shadow-green-600/20",
  },
  entregado: {
    label: "Entrega completada",
    action: "Completado",
    icon: CheckCircle2,
    color: "bg-green-600",
  },
};

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function EntregaActivaPage() {
  const { repartidor, loading: repartidorLoading } = useRepartidor();
  const { order: activeOrder, loading: orderLoading } = useActiveOrder(
    repartidor?.id
  );
  const [elapsed, setElapsed] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  const loading = repartidorLoading || orderLoading;
  const currentStatus = activeOrder?.status ?? "entregado";

  useEffect(() => {
    if (!activeOrder || currentStatus === "entregado") return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrder, currentStatus]);

  const handleNextStep = useCallback(async () => {
    if (!activeOrder) return;
    setAdvancing(true);

    const result = await advanceOrderStatus(activeOrder.id);

    if (result.error) {
      toast.error("Error al avanzar", { description: result.error });
    } else if (result.new_status === "en_camino") {
      toast.info("En camino al cliente", {
        description: "Contacta al cliente si es necesario.",
      });
    } else if (result.new_status === "entregado") {
      toast.success("Entrega completada", {
        description: `Has ganado ${formatCLP(
          PAGO_REPARTIDOR * activeOrder.cantidad_bidones
        )} por esta entrega.`,
      });
    }
    setAdvancing(false);
  }, [activeOrder]);

  const handleNavigate = () => {
    if (activeOrder?.lat && activeOrder?.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${activeOrder.lat},${activeOrder.lng}`,
        "_blank"
      );
    } else {
      toast.info("Abriendo navegación...", {
        description: "Coordenadas no disponibles.",
      });
    }
  };

  const handleCall = () => {
    const phone = activeOrder?.cliente?.phone;
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    } else {
      toast.info("Teléfono no disponible");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 flex size-20 items-center justify-center rounded-full bg-muted"
        >
          <PackageCheck className="size-9 text-muted-foreground" />
        </motion.div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Sin entrega activa
        </h3>
        <p className="max-w-[260px] text-sm text-muted-foreground leading-relaxed">
          Acepta un pedido desde la pestaña de Pedidos para comenzar una entrega.
        </p>
      </div>
    );
  }

  const stepConfig = STEP_CONFIG[currentStatus] ?? STEP_CONFIG["entregado"];
  const StepIcon = stepConfig.icon;
  const earnings = PAGO_REPARTIDOR * activeOrder.cantidad_bidones;

  const stepIndex =
    currentStatus === "asignado" ? 0 : currentStatus === "en_camino" ? 1 : 2;

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={
              currentStatus !== "entregado"
                ? { scale: [1, 1.15, 1] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <StepIcon
              className={`size-5 ${
                currentStatus === "entregado"
                  ? "text-green-600"
                  : "text-purple-600"
              }`}
            />
          </motion.div>
          <span className="text-sm font-semibold text-foreground">
            {stepConfig.label}
          </span>
        </div>
        <Badge
          className={
            ORDER_STATUS_COLORS[
              currentStatus === "entregado" ? "entregado" : currentStatus
            ]
          }
        >
          {ORDER_STATUS_LABELS[currentStatus as keyof typeof ORDER_STATUS_LABELS]}
        </Badge>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1 px-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= stepIndex ? "bg-primary" : "bg-muted"
            }`}
            initial={false}
            animate={i <= stepIndex ? { opacity: 1 } : { opacity: 0.5 }}
          />
        ))}
      </div>

      {/* Timer */}
      <Card className="border-border/60 py-0 shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-orange-50">
              <Clock className="size-4.5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiempo transcurrido</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatTime(elapsed)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Ganancia</p>
            <p className="text-lg font-bold text-green-600">
              {formatCLP(earnings)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card className="overflow-hidden border-border/60 py-0 shadow-sm">
        <div className="relative h-40 bg-gradient-to-br from-blue-50 via-blue-100/50 to-primary/10">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 160">
            <motion.path
              d="M 40 120 Q 120 20, 200 80 T 360 40"
              fill="none"
              stroke="oklch(0.45 0.27 264)"
              strokeWidth="3"
              strokeDasharray="8 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <circle cx="40" cy="120" r="6" fill="oklch(0.45 0.27 264)" />
            <circle cx="40" cy="120" r="3" fill="white" />
            <motion.circle
              cx="360"
              cy="40"
              r="6"
              fill="#16a34a"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <circle cx="360" cy="40" r="3" fill="white" />
          </svg>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 backdrop-blur-sm">
            <Map className="size-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Vista del mapa
            </span>
          </div>
        </div>
        <CardContent className="p-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleNavigate}
          >
            <Navigation className="size-4" />
            Navegar
          </Button>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card className="border-border/60 py-0 shadow-sm">
        <CardHeader className="px-4 py-3 pb-0">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Datos del cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-blue-50">
                <User className="size-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {activeOrder.cliente?.name || "Cliente"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeOrder.cliente?.phone || "Sin teléfono"}
                </p>
              </div>
            </div>
            <Button
              size="icon-sm"
              variant="outline"
              className="rounded-full"
              onClick={handleCall}
            >
              <Phone className="size-4 text-green-600" />
            </Button>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-muted/50 p-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground leading-snug">
              {activeOrder.address}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card className="border-border/60 py-0 shadow-sm">
        <CardHeader className="px-4 py-3 pb-0">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Detalle del pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-primary" />
              <span className="text-sm text-foreground">
                {activeOrder.cantidad_bidones}{" "}
                {activeOrder.cantidad_bidones === 1 ? "bidón" : "bidones"} (20L)
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCLP(activeOrder.total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <AnimatePresence mode="wait">
        {currentStatus !== "entregado" ? (
          <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button
              size="lg"
              className={`w-full h-14 text-base font-bold text-white shadow-lg ${stepConfig.color} transition-all active:scale-[0.98]`}
              onClick={handleNextStep}
              disabled={advancing}
            >
              {advancing ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <StepIcon className="size-5" />
                  {stepConfig.action}
                  <ChevronRight className="size-5" />
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-green-200 bg-green-50 p-5 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="size-7 text-green-600" />
            </motion.div>
            <h3 className="text-lg font-bold text-green-800">
              Entrega completada
            </h3>
            <p className="mt-1 text-sm text-green-600">
              Ganaste {formatCLP(earnings)} en {formatTime(elapsed)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
