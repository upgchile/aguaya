"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, DollarSign, Droplets, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  RepartidorProvider,
  useRepartidor,
} from "@/lib/hooks/use-repartidor";
import { signOut } from "@/lib/auth-actions";
import { toggleRepartidorStatus } from "@/lib/actions/repartidor-actions";
import { toast } from "sonner";

const tabs = [
  { label: "Pedidos", href: "/repartidor", icon: Package },
  { label: "Entrega", href: "/repartidor/activo", icon: Truck },
  { label: "Ganancias", href: "/repartidor/ganancias", icon: DollarSign },
];

export default function RepartidorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RepartidorProvider>
      <RepartidorShell>{children}</RepartidorShell>
    </RepartidorProvider>
  );
}

function RepartidorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { name } = useAuth();
  const { repartidor, setRepartidor } = useRepartidor();
  const [toggling, setToggling] = useState(false);

  const isDisponible = repartidor?.status === "disponible";
  const isOcupado = repartidor?.status === "ocupado";

  const handleToggle = async (checked: boolean) => {
    if (isOcupado) {
      toast.error("No puedes cambiar tu estado durante una entrega activa.");
      return;
    }

    const newStatus = checked ? "disponible" : "offline";
    const previousStatus = repartidor?.status;

    // Optimistic update
    if (repartidor) {
      setRepartidor({ ...repartidor, status: newStatus });
    }

    setToggling(true);
    const result = await toggleRepartidorStatus(newStatus);

    if (result.error) {
      // Revert on error
      if (repartidor && previousStatus) {
        setRepartidor({ ...repartidor, status: previousStatus });
      }
      toast.error("Error al cambiar estado", { description: result.error });
    }
    setToggling(false);
  };

  const statusLabel = isOcupado
    ? "En entrega"
    : isDisponible
    ? "Disponible"
    : "No disponible";

  const statusDotClass = isOcupado
    ? "bg-orange-500 animate-pulse"
    : isDisponible
    ? "bg-green-500 animate-pulse"
    : "bg-gray-400";

  const statusTextClass = isOcupado
    ? "text-orange-600"
    : isDisponible
    ? "text-green-600"
    : "text-muted-foreground";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Droplets className="size-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Aguaya
            </span>
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
              Repartidor
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={repartidor?.status ?? "loading"}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                <span
                  className={`inline-block size-2 rounded-full ${statusDotClass}`}
                />
                <span className={`text-xs font-medium ${statusTextClass}`}>
                  {statusLabel}
                </span>
              </motion.div>
            </AnimatePresence>
            <Switch
              checked={isDisponible || isOcupado}
              onCheckedChange={handleToggle}
              disabled={toggling || isOcupado}
              className="data-[state=checked]:bg-green-500"
            />
            <button
              onClick={() => signOut()}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Cerrar sesion"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/repartidor"
                ? pathname === "/repartidor"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
              >
                <div className="relative">
                  <Icon
                    className={`size-5 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area padding for devices with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
