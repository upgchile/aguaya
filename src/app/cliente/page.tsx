"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  MapPin,
  Clock,
  Navigation,
  Shield,
  CalendarClock,
  Zap,
  Check,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PRECIO_BIDON } from "@/lib/types";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

function getDiscount(qty: number): number {
  if (qty >= 5) return 0.1;
  if (qty >= 3) return 0.05;
  return 0;
}

export default function ClienteOrderPage() {
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const [address, setAddress] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"ahora" | "agendar">(
    "ahora"
  );
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const discount = getDiscount(cantidad);
  const subtotal = cantidad * PRECIO_BIDON;
  const total = Math.round(subtotal * (1 - discount));

  const increment = useCallback(() => {
    setCantidad((prev) => Math.min(prev + 1, 10));
  }, []);

  const decrement = useCallback(() => {
    setCantidad((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setRipple(null), 600);

    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderSuccess(true);
      setTimeout(() => {
        router.push("/cliente/tracking");
      }, 2000);
    }, 1200);
  };

  return (
    <div className="relative px-4 pt-4">
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          >
            {/* Confetti particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-2 rounded-full"
                style={{
                  backgroundColor: [
                    "#0046FF",
                    "#22c55e",
                    "#f59e0b",
                    "#ec4899",
                    "#8b5cf6",
                  ][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  y: [0, -100 - Math.random() * 150],
                  x: [(Math.random() - 0.5) * 200],
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-6 flex size-24 items-center justify-center rounded-full bg-green-500"
            >
              <Check className="size-12 text-white" strokeWidth={3} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground"
            >
              Pedido Confirmado
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-muted-foreground"
            >
              Redirigiendo al tracking...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Hola Maria!
        </h1>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 text-primary" />
          <span>Providencia, Santiago</span>
        </div>
      </motion.div>

      {/* Quantity Selector */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md">
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="size-5 text-primary" />
                <span className="font-semibold text-foreground">
                  Bidones 20L
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatCLP(PRECIO_BIDON)} c/u
              </span>
            </div>

            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={decrement}
                disabled={cantidad <= 1}
                className="size-12 rounded-full text-lg"
              >
                <Minus className="size-5" />
              </Button>
              <motion.span
                key={cantidad}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 text-center text-5xl font-bold text-foreground"
              >
                {cantidad}
              </motion.span>
              <Button
                variant="outline"
                size="icon"
                onClick={increment}
                disabled={cantidad >= 10}
                className="size-12 rounded-full text-lg"
              >
                <Plus className="size-5" />
              </Button>
            </div>

            {/* Discount badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <AnimatePresence>
                {cantidad >= 3 && cantidad < 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      3+ bidones: 5% off
                    </Badge>
                  </motion.div>
                )}
                {cantidad >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      5+ bidones: 10% off
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between rounded-xl bg-primary/5 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">
                Total
              </span>
              <div className="flex items-baseline gap-2">
                {discount > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCLP(subtotal)}
                  </span>
                )}
                <motion.span
                  key={total}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-primary"
                >
                  {formatCLP(total)}
                </motion.span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Address */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-4"
      >
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Direccion de entrega
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ej: Av. Providencia 1234, depto 5B"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
      </motion.div>

      {/* Schedule Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-4"
      >
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Cuando lo quieres?
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setScheduleMode("ahora")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
              scheduleMode === "ahora"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            <Zap className="size-4" />
            Ahora
          </button>
          <button
            onClick={() => setScheduleMode("agendar")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
              scheduleMode === "agendar"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            <CalendarClock className="size-4" />
            Agendar
          </button>
        </div>
        <AnimatePresence>
          {scheduleMode === "agendar" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
                <CalendarClock className="mx-auto mb-1 size-5" />
                Selector de fecha y hora - proximamente
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Order Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-6"
      >
        <Button
          onClick={handleOrder}
          disabled={isOrdering}
          className="relative h-14 w-full overflow-hidden rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg animate-pulse-ring hover:bg-primary/90 disabled:animate-none"
        >
          {/* Ripple */}
          <AnimatePresence>
            {ripple && (
              <motion.span
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute size-12 rounded-full bg-white/30"
                style={{ left: ripple.x - 24, top: ripple.y - 24 }}
              />
            )}
          </AnimatePresence>

          {isOrdering ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="size-5 rounded-full border-2 border-white/30 border-t-white"
              />
              Procesando...
            </motion.div>
          ) : (
            <>
              <Droplets className="size-5" />
              Pedir Ahora
            </>
          )}
        </Button>
      </motion.div>

      {/* Benefit Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mb-6 mt-6 grid grid-cols-3 gap-3"
      >
        {[
          { icon: Clock, label: "30 min", sublabel: "Entrega rapida" },
          { icon: Navigation, label: "GPS", sublabel: "Tracking real" },
          { icon: Shield, label: "Seguro", sublabel: "Pago protegido" },
        ].map((benefit) => (
          <Card
            key={benefit.label}
            className="border-0 py-4 shadow-sm"
          >
            <CardContent className="flex flex-col items-center gap-1.5 px-2 py-0">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <benefit.icon className="size-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {benefit.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {benefit.sublabel}
              </span>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
