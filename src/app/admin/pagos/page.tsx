"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  CheckCircle2,
  Clock,
  BanknoteIcon,
  ArrowUpRight,
} from "lucide-react";
import { mockPayments, mockRepartidor } from "@/lib/mock-data";
import type { Payment, PaymentStatus } from "@/lib/types";

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
};

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  const pendingTotal = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pendiente")
        .reduce((sum, p) => sum + p.monto_neto, 0),
    [payments]
  );

  const paidTotal = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pagado")
        .reduce((sum, p) => sum + p.monto_neto, 0),
    [payments]
  );

  const pendingCount = useMemo(
    () => payments.filter((p) => p.status === "pendiente").length,
    [payments]
  );

  const formatCLP = (amount: number) => {
    return `$${amount.toLocaleString("es-CL")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLiquidar = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: "pagado" as PaymentStatus, paid_at: new Date().toISOString() }
          : p
      )
    );
    toast.success("Pago liquidado exitosamente", {
      description: `Liquidacion ${paymentId} procesada.`,
    });
  };

  const handleLiquidarTodo = () => {
    const pendientes = payments.filter((p) => p.status === "pendiente");
    if (pendientes.length === 0) {
      toast.info("No hay pagos pendientes por liquidar.");
      return;
    }
    setPayments((prev) =>
      prev.map((p) =>
        p.status === "pendiente"
          ? { ...p, status: "pagado" as PaymentStatus, paid_at: new Date().toISOString() }
          : p
      )
    );
    toast.success(`${pendientes.length} pagos liquidados`, {
      description: `Total liquidado: ${formatCLP(
        pendientes.reduce((sum, p) => sum + p.monto_neto, 0)
      )}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title + Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pagos y Liquidaciones
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los pagos a repartidores por sus entregas
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleLiquidarTodo}
          disabled={pendingCount === 0}
        >
          <BanknoteIcon className="mr-2 h-4 w-4" />
          Liquidar Todo ({pendingCount})
        </Button>
      </div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-700">
                  Pendiente de Pago
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCLP(pendingTotal)}
                </p>
                <p className="text-xs text-yellow-600">
                  {pendingCount} liquidaciones pendientes
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-700">
                  Total Pagado
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCLP(paidTotal)}
                </p>
                <p className="text-xs text-green-600">
                  {payments.filter((p) => p.status === "pagado").length}{" "}
                  liquidaciones completadas
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payments table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              Detalle de Liquidaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead className="text-right">Monto Bruto</TableHead>
                    <TableHead className="text-right">Comisi&oacute;n</TableHead>
                    <TableHead className="text-right">Monto Neto</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acci&oacute;n</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {mockRepartidor.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {payment.order_id}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCLP(payment.monto_bruto)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCLP(payment.comision)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCLP(payment.monto_neto)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            PAYMENT_STATUS_COLORS[payment.status]
                          }`}
                        >
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === "pendiente" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-primary text-primary hover:bg-primary hover:text-white"
                            onClick={() => handleLiquidar(payment.id)}
                          >
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            Liquidar
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {payment.paid_at
                              ? formatDate(payment.paid_at)
                              : "---"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-gray-400"
                      >
                        No hay liquidaciones registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
