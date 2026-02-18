"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Clock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/use-auth";
import { signOut } from "@/lib/auth-actions";

const tabs = [
  { label: "Pedir", href: "/cliente", icon: Home },
  { label: "Tracking", href: "/cliente/tracking", icon: MapPin },
  { label: "Historial", href: "/cliente/historial", icon: Clock },
];

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { name, loading } = useAuth();

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/cliente" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                A
              </span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Aguaya
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {loading ? "..." : initials}
            </div>
            <button
              onClick={() => signOut()}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Cerrar sesion"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 glass border-t border-border/50">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-safe">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/cliente"
                ? pathname === "/cliente"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                <div className="relative flex flex-col items-center">
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -inset-x-3 -inset-y-1 rounded-xl bg-primary/10"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon
                    className={`relative size-5 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`relative text-[10px] font-medium transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
