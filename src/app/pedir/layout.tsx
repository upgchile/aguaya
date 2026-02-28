"use client";

import Link from "next/link";
import { ArrowLeft, Droplet } from "lucide-react";
import { motion } from "framer-motion";

export default function PedirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glass sticky top-0 z-50 border-b border-border/50"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
            <span className="text-sm font-medium">Volver</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Droplet className="size-6 fill-primary text-primary" />
            <span className="text-lg font-bold tracking-tight text-primary">
              Aguaya
            </span>
          </Link>
          <div className="w-16" />
        </div>
      </motion.header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
