"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Percent,
  CreditCard,
  Droplets,
  LogOut,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Comisiones", href: "/admin/comisiones", icon: Percent },
  { label: "Pagos", href: "/admin/pagos", icon: CreditCard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo + Admin badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Aguaya</span>
            </Link>
            <Badge variant="destructive" className="text-xs font-semibold">
              Admin
            </Badge>
          </div>

          {/* User dropdown placeholder */}
          <Button variant="ghost" className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
              AA
            </div>
            <span className="hidden sm:inline">Admin Aguaya</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Horizontal tab navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Admin navigation">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors"
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-gray-400"}`} />
                  <span className={active ? "text-primary" : "text-gray-500 hover:text-gray-700"}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="admin-tab-indicator"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
