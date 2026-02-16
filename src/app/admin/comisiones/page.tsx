"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  Percent,
  Save,
  Info,
  Truck,
  Building2,
  Droplets,
} from "lucide-react";

export default function ComisionesPage() {
  const [precioBidon, setPrecioBidon] = useState(4500);
  const [comisionPlataforma, setComisionPlataforma] = useState(500);
  const [descuento3, setDescuento3] = useState(5);
  const [descuento5, setDescuento5] = useState(10);

  const pagoRepartidor = useMemo(
    () => precioBidon - comisionPlataforma - 1000,
    [precioBidon, comisionPlataforma]
  );

  const handleSave = () => {
    toast.success("Configuracion guardada exitosamente", {
      description: "Los nuevos valores de comisiones se aplicaran a los proximos pedidos.",
    });
  };

  const formatCLP = (amount: number) => {
    return `$${amount.toLocaleString("es-CL")}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Configuraci&oacute;n de Comisiones
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona los precios, comisiones y descuentos de la plataforma
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration form */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Precios y Comisiones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Precio por bidon */}
              <div className="space-y-2">
                <Label htmlFor="precio">Precio por Bid&oacute;n (CLP)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    $
                  </span>
                  <Input
                    id="precio"
                    type="number"
                    className="pl-7"
                    value={precioBidon}
                    onChange={(e) => setPrecioBidon(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Comision plataforma */}
              <div className="space-y-2">
                <Label htmlFor="comision">
                  Comisi&oacute;n Plataforma por Bid&oacute;n (CLP)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    $
                  </span>
                  <Input
                    id="comision"
                    type="number"
                    className="pl-7"
                    value={comisionPlataforma}
                    onChange={(e) =>
                      setComisionPlataforma(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Pago repartidor (auto-calculated) */}
              <div className="space-y-2">
                <Label htmlFor="pagoRepartidor">
                  Pago Repartidor por Bid&oacute;n (CLP)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    $
                  </span>
                  <Input
                    id="pagoRepartidor"
                    type="number"
                    className="bg-gray-50 pl-7 font-semibold"
                    value={pagoRepartidor}
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Calculado autom&aacute;ticamente: Precio - Comisi&oacute;n - Costo agua ($1.000)
                </p>
              </div>

              {/* Divider */}
              <div className="border-t pt-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Percent className="h-4 w-4 text-primary" />
                  Descuentos por Volumen
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Descuento 3+ */}
                  <div className="space-y-2">
                    <Label htmlFor="desc3">Descuento 3+ bidones (%)</Label>
                    <div className="relative">
                      <Input
                        id="desc3"
                        type="number"
                        min={0}
                        max={100}
                        value={descuento3}
                        onChange={(e) => setDescuento3(Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Descuento 5+ */}
                  <div className="space-y-2">
                    <Label htmlFor="desc5">Descuento 5+ bidones (%)</Label>
                    <div className="relative">
                      <Input
                        id="desc5"
                        type="number"
                        min={0}
                        max={100}
                        value={descuento5}
                        onChange={(e) => setDescuento5(Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleSave}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee structure info card */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                Estructura de Cobros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Desglose por cada bid&oacute;n de 20L vendido en la plataforma:
              </p>

              <div className="space-y-3">
                {/* Cliente paga */}
                <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Cliente paga
                      </p>
                      <p className="text-xs text-gray-500">Precio total</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCLP(precioBidon)}
                  </span>
                </div>

                {/* Plataforma recibe */}
                <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Plataforma recibe
                      </p>
                      <p className="text-xs text-gray-500">
                        Comisi&oacute;n por servicio
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatCLP(comisionPlataforma)}
                  </span>
                </div>

                {/* Repartidor recibe */}
                <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Truck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Repartidor recibe
                      </p>
                      <p className="text-xs text-gray-500">Pago por entrega</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatCLP(pagoRepartidor)}
                  </span>
                </div>

                {/* Proveedor agua */}
                <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
                      <Droplets className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Proveedor agua
                      </p>
                      <p className="text-xs text-gray-500">Costo del bid&oacute;n</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-cyan-600">
                    {formatCLP(1000)}
                  </span>
                </div>
              </div>

              {/* Discount info */}
              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-orange-800">
                  Descuentos activos
                </h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>
                    3+ bidones: <strong>{descuento3}% de descuento</strong>{" "}
                    (precio unitario:{" "}
                    {formatCLP(
                      Math.round(precioBidon * (1 - descuento3 / 100))
                    )}
                    )
                  </li>
                  <li>
                    5+ bidones: <strong>{descuento5}% de descuento</strong>{" "}
                    (precio unitario:{" "}
                    {formatCLP(
                      Math.round(precioBidon * (1 - descuento5 / 100))
                    )}
                    )
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
