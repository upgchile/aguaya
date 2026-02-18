"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CalendarDays,
  Star,
  Droplets,
  Clock,
  Target,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRepartidor } from "@/lib/hooks/use-repartidor";
import { useEarnings } from "@/lib/hooks/use-earnings";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DAILY_GOAL = 30000;

export default function GananciasPage() {
  const { repartidor, loading: repartidorLoading } = useRepartidor();
  const {
    today,
    week,
    month,
    todayDeliveries,
    weekDeliveries,
    monthDeliveries,
    recentOrders,
    pagoRepartidor,
    loading: earningsLoading,
  } = useEarnings(repartidor?.id);

  const loading = repartidorLoading || earningsLoading;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Cargando ganancias...</p>
      </div>
    );
  }

  const rating = repartidor?.rating ?? 5.0;
  const total_entregas = repartidor?.total_entregas ?? 0;
  const goalProgress = Math.min((today / DAILY_GOAL) * 100, 100);

  const summaryCards = [
    {
      label: "Hoy",
      amount: today,
      deliveries: todayDeliveries,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Esta semana",
      amount: week,
      deliveries: weekDeliveries,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-blue-50",
    },
    {
      label: "Este mes",
      amount: month,
      deliveries: monthDeliveries,
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Ganancias</h1>
        <Badge variant="secondary" className="gap-1 text-xs font-semibold">
          <Award className="size-3" />
          {total_entregas >= 100 ? "Nivel Oro" : total_entregas >= 50 ? "Nivel Plata" : "Nivel Bronce"}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 400, damping: 30 }}
            >
              <Card className="border-border/60 py-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div
                    className={`mx-auto mb-2 flex size-8 items-center justify-center rounded-full ${card.bgColor}`}
                  >
                    <Icon className={`size-4 ${card.color}`} />
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className={`text-base font-bold ${card.color} mt-0.5`}>
                    {formatCLP(card.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {card.deliveries} entregas
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Daily Goal */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/60 py-0 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Meta diaria
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {formatCLP(DAILY_GOAL)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatCLP(today)} ganados
              </span>
              <span className="text-xs font-medium text-primary">
                {Math.round(goalProgress)}%
              </span>
            </div>

            {today < DAILY_GOAL && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-2.5">
                <TrendingUp className="size-4 text-primary shrink-0" />
                <p className="text-xs text-primary/80">
                  Te faltan{" "}
                  <span className="font-bold text-primary">
                    {formatCLP(DAILY_GOAL - today)}
                  </span>{" "}
                  para alcanzar tu meta. ({Math.ceil((DAILY_GOAL - today) / pagoRepartidor)} entregas más)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rating & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/60 py-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              {/* Rating */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-full bg-yellow-50">
                  <Star className="size-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{Number(rating).toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Calificación</p>
                </div>
              </div>

              <div className="h-10 w-px bg-border" />

              {/* Total deliveries */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-50">
                  <Droplets className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {total_entregas}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Entregas totales</p>
                </div>
              </div>
            </div>

            {/* Stars visualization */}
            <div className="mt-3 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-4 ${
                    star <= Math.floor(Number(rating))
                      ? "text-yellow-400 fill-yellow-400"
                      : star <= Number(rating)
                      ? "text-yellow-400 fill-yellow-400/50"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({total_entregas} reseñas)
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Deliveries */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border/60 py-0 shadow-sm">
          <CardHeader className="px-4 py-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Entregas recientes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => {
                  const earnings = pagoRepartidor * order.cantidad_bidones;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.08 }}
                      className="flex items-center justify-between rounded-lg bg-muted/40 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-green-50">
                          <Droplets className="size-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {order.cantidad_bidones}{" "}
                            {order.cantidad_bidones === 1
                              ? "bidón"
                              : "bidones"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="size-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {order.delivered_at
                                ? formatTime(order.delivered_at)
                                : "--:--"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        +{formatCLP(earnings)}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aún no tienes entregas completadas.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earnings Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-border/60 py-0 shadow-sm">
          <CardHeader className="px-4 py-3 pb-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              Cómo se calcula
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Por cada bidón entregado</span>
                <span className="font-semibold text-foreground">
                  {formatCLP(pagoRepartidor)}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Ejemplo: 2 bidones
                </span>
                <span className="font-semibold text-green-600">
                  {formatCLP(pagoRepartidor * 2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
