"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Droplets,
  MapPin,
  Truck,
  Clock,
  Navigation,
  ShieldCheck,
  Wallet,
  CalendarClock,
  UserCheck,
  Droplet,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Animation helpers                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.15, ease: "easeOut" as const },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    icon: Droplets,
    title: "Elige tu cantidad",
    description: "Selecciona de 1 a 10 bidones de agua purificada de 20 litros.",
  },
  {
    icon: MapPin,
    title: "Confirma tu dirección",
    description:
      "Ubicación automática vía GPS. Solo confirma y listo.",
  },
  {
    icon: Truck,
    title: "Recibe en 30 min",
    description:
      "Un repartidor cercano se pone en camino al instante.",
  },
];

const stats = [
  { icon: Clock, label: "30 min", sublabel: "Entrega" },
  { icon: Navigation, label: "GPS", sublabel: "En Vivo" },
  { icon: ShieldCheck, label: "100%", sublabel: "Seguro" },
];

const driverPerks = [
  {
    icon: Wallet,
    title: "$3.000 por entrega",
    description: "Ganancias competitivas por cada bidón entregado.",
  },
  {
    icon: CalendarClock,
    title: "Horario flexible",
    description: "Trabaja cuando quieras, sin turnos fijos.",
  },
  {
    icon: UserCheck,
    title: "Sin jefe, tú decides",
    description: "Sé tu propio jefe. Acepta o rechaza pedidos.",
  },
];

const navLinks = [
  { href: "#como-funciona", label: "Cómo Funciona" },
  { href: "#precios", label: "Precios" },
  { href: "#repartidores", label: "Repartidores" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-sans">
      {/* ================================================================== */}
      {/*  HEADER / NAV                                                      */}
      {/* ================================================================== */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass fixed top-0 right-0 left-0 z-50 border-b border-white/20"
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Droplet className="size-7 fill-primary text-primary" />
            <span className="text-xl font-bold tracking-tight text-primary">
              Aguaya
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <Button asChild size="sm" className="rounded-full">
              <Link href="/cliente">Pedir Ahora</Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 transition-colors hover:text-primary md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </nav>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t border-white/20 md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
              <Button asChild size="sm" className="mt-1 w-full rounded-full">
                <Link href="/cliente">Pedir Ahora</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* ================================================================== */}
      {/*  HERO SECTION                                                      */}
      {/* ================================================================== */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-16">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent" />

        {/* Decorative floating circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[10%] size-64 rounded-full bg-primary/5 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] left-[5%] size-80 rounded-full bg-primary/4 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] left-[50%] size-48 rounded-full bg-primary/3 blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Agua pura,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              al instante
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg"
          >
            Bidones de 20L de agua purificada a tu puerta
          </motion.p>

          {/* Big circular CTA button - Lovable style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" as const }}
            className="mt-10 flex justify-center"
          >
            <Link href="/cliente" className="group relative">
              {/* Outer pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary"
              />
              {/* Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex size-40 flex-col items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/85 shadow-2xl shadow-primary/30 transition-shadow hover:shadow-primary/40 sm:size-48"
              >
                <Droplets className="mb-2 size-8 text-white/90 sm:size-9" />
                <span className="text-lg font-bold text-white sm:text-xl">
                  Pedir Ahora
                </span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Delivery promise */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-8 text-sm text-muted-foreground"
          >
            Entrega inmediata en menos de{" "}
            <span className="font-semibold text-primary">30 minutos</span>
          </motion.p>

          {/* Agendar entrega */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-4"
          >
            <Link
              href="/cliente"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-5 py-2.5 text-sm font-medium text-foreground/70 backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary"
            >
              <CalendarClock className="size-4" />
              Agendar entrega
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-white/70 px-4 py-5 shadow-sm backdrop-blur-sm"
              >
                <stat.icon className="size-6 text-primary" />
                <p className="text-sm font-bold text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  COMO FUNCIONA                                                     */}
      {/* ================================================================== */}
      <section
        id="como-funciona"
        className="relative py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Simple y rápido
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cómo Funciona
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              En solo tres pasos, tienes agua purificada en tu puerta.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="glass group relative rounded-2xl p-8 shadow-lg transition-shadow hover:shadow-xl"
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-3 flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                  {i + 1}
                </div>

                <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                  <step.icon className="size-7 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  PRECIOS                                                           */}
      {/* ================================================================== */}
      <section
        id="precios"
        className="relative py-24 sm:py-32"
      >
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Transparente
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Precios
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Sin costos ocultos. Sin suscripciones. Paga solo lo que pides.
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mx-auto mt-16 max-w-md"
          >
            <div className="glass overflow-hidden rounded-2xl shadow-lg">
              {/* Price header */}
              <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-10 text-center text-primary-foreground">
                <Droplets className="mx-auto mb-3 size-10 opacity-80" />
                <p className="text-sm font-medium uppercase tracking-wider opacity-80">
                  Bidón 20 Litros
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">
                    $4.500
                  </span>
                  <span className="text-lg font-medium opacity-70">CLP</span>
                </div>
                <p className="mt-2 text-sm opacity-80">Despacho incluido</p>
              </div>

              {/* Features */}
              <div className="px-8 py-8">
                <ul className="space-y-4">
                  {[
                    "Agua purificada de alta calidad",
                    "Despacho en menos de 30 minutos",
                    "Mínimo 1 bidón por pedido",
                    "Seguimiento GPS en tiempo real",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Discounts */}
                <div className="mt-8 rounded-xl border border-primary/10 bg-primary/5 p-5">
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    Descuentos por volumen
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        3+ bidones
                      </span>
                      <span className="font-semibold text-primary">5% off</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        5+ bidones
                      </span>
                      <span className="font-semibold text-primary">
                        10% off
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="mt-8 h-12 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/20"
                >
                  <Link href="/cliente">Pedir Ahora</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  PARA REPARTIDORES                                                 */}
      {/* ================================================================== */}
      <section
        id="repartidores"
        className="relative py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Oportunidad
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Gana dinero entregando agua
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Conviértete en repartidor Aguaya. Trabaja cuando quieras, gana lo
              que quieras.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {driverPerks.map((perk, i) => (
              <motion.div
                key={perk.title}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                className="glass group rounded-2xl p-8 shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/15">
                  <perk.icon className="size-7 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {perk.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {perk.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-12 text-center"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25"
            >
              <Link href="/repartidor">Regístrate como repartidor</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FOOTER                                                            */}
      {/* ================================================================== */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Droplet className="size-6 fill-primary text-primary" />
              <span className="text-lg font-bold tracking-tight text-primary">
                Aguaya
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/terminos"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Términos
              </Link>
              <Link
                href="/privacidad"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacidad
              </Link>
              <Link
                href="/contacto"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Contacto
              </Link>
            </div>
          </motion.div>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Aguaya. Desarrollado por{" "}
              <a
                href="https://upg.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                UPG
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
