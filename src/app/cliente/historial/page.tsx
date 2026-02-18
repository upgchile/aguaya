"use client";

import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Droplets,
  PackageCheck,
  InboxIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/types";
import { useClientOrders } from "@/lib/hooks/use-client-orders";
import { RatingStars } from "@/components/rating-stars";

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialPage() {
  const { history, loading } = useClientOrders();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <h1 className="text-xl font-bold text-foreground">Historial</h1>
        <p className="text-sm text-muted-foreground">
          Tus pedidos anteriores
        </p>
      </motion.div>

      {history.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <InboxIcon className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Aun no tienes pedidos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus pedidos completados apareceran aqui
          </p>
        </motion.div>
      ) : (
        /* Order List */
        <div className="mb-6 space-y-3">
          {history.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.08 }}
            >
              <Card className="border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-green-50">
                        <PackageCheck className="size-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {order.cantidad_bidones}{" "}
                          {order.cantidad_bidones === 1
                            ? "bidon"
                            : "bidones"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {formatCLP(order.total)}
                      </p>
                      <Badge
                        className={`mt-1 text-[10px] ${
                          ORDER_STATUS_COLORS[order.status]
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-start gap-1.5 border-t border-border/50 pt-2">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {order.address}
                    </span>
                  </div>
                  {order.delivered_at && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Droplets className="size-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Entregado el{" "}
                        {formatDate(order.delivered_at)}
                      </span>
                    </div>
                  )}
                  {order.status === "entregado" && (
                    <div className="mt-2 border-t border-border/50 pt-2">
                      <RatingStars
                        orderId={order.id}
                        existingRating={order.rating}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
