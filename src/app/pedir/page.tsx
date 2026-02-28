"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  MapPin,
  Droplets,
  Check,
  Banknote,
  Landmark,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Clock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRECIO_BIDON } from "@/lib/types";
import type { PaymentMethod } from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  createOrder,
  createOrderWithAuth,
} from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Constants ─── */

const STORAGE_KEY = "aguaya_pending_order";
const REFRESH_FLAG_KEY = "aguaya_wizard_refresh";

const STEP_LABELS = ["Cantidad", "Dirección", "Pago", "Resumen", "Cuenta"];

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
  enabled: boolean;
}[] = [
  {
    id: "efectivo",
    label: "Efectivo",
    description: "Paga al recibir tu pedido",
    icon: Banknote,
    enabled: true,
  },
  {
    id: "transferencia",
    label: "Transferencia",
    description: "Transferencia bancaria al entregar",
    icon: Landmark,
    enabled: true,
  },
  {
    id: "tarjeta",
    label: "Tarjeta",
    description: "Débito o crédito",
    icon: CreditCard,
    enabled: false,
  },
];

/* ─── Helpers ─── */

function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

function getDiscount(qty: number): number {
  if (qty >= 5) return 0.1;
  if (qty >= 3) return 0.05;
  return 0;
}

interface WizardState {
  step: number;
  cantidad: number;
  address: string;
  paymentMethod: PaymentMethod | null;
}

function saveWizardState(data: WizardState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadWizardState(): WizardState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearWizardState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/* ─── Animation variants ─── */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 250 : -250,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -250 : 250,
    opacity: 0,
  }),
};

/* ─── Component ─── */

export default function PedirPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [cantidad, setCantidad] = useState(1);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const totalSteps = isAuthenticated ? 4 : 5;
  const discount = getDiscount(cantidad);
  const subtotal = cantidad * PRECIO_BIDON;
  const total = Math.round(subtotal * (1 - discount));

  /* ─── localStorage persistence ─── */

  useEffect(() => {
    const wasRefresh = sessionStorage.getItem(REFRESH_FLAG_KEY) === "true";
    sessionStorage.removeItem(REFRESH_FLAG_KEY);

    if (wasRefresh) {
      const saved = loadWizardState();
      if (saved) {
        if (saved.cantidad >= 1 && saved.cantidad <= 10)
          setCantidad(saved.cantidad);
        if (saved.address) setAddress(saved.address);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
        if (saved.step > 0) setStep(Math.min(saved.step, 3));
      }
    } else {
      clearWizardState();
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveWizardState({ step, cantidad, address, paymentMethod });
  }, [step, cantidad, address, paymentMethod, hydrated]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(REFRESH_FLAG_KEY, "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  /* ─── Navigation ─── */

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const increment = useCallback(
    () => setCantidad((p) => Math.min(p + 1, 10)),
    []
  );
  const decrement = useCallback(
    () => setCantidad((p) => Math.max(p - 1, 1)),
    []
  );

  /* ─── Validation ─── */

  const canProceed = (() => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return address.trim().length > 0;
      case 2:
        return paymentMethod !== null;
      case 3:
        return true;
      case 4: {
        const { email, password, name, phone } = authForm;
        if (authMode === "signup") {
          return (
            email.length > 0 &&
            password.length >= 6 &&
            name.length > 0 &&
            phone.length > 0
          );
        }
        return email.length > 0 && password.length > 0;
      }
      default:
        return false;
    }
  })();

  /* ─── Order creation ─── */

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    const result = await createOrder({
      cantidad_bidones: cantidad,
      address: address.trim(),
      payment_method: paymentMethod!,
    });
    if (result.error) {
      toast.error("Error al crear pedido", { description: result.error });
      setIsSubmitting(false);
      return;
    }
    clearWizardState();
    setIsSubmitting(false);
    setOrderSuccess(true);
    setTimeout(() => router.push("/cliente/tracking"), 2000);
  };

  const handleCreateOrderWithAuth = async () => {
    setIsSubmitting(true);
    const result = await createOrderWithAuth({
      cantidad_bidones: cantidad,
      address: address.trim(),
      payment_method: paymentMethod!,
      auth: {
        mode: authMode,
        email: authForm.email,
        password: authForm.password,
        ...(authMode === "signup"
          ? { name: authForm.name, phone: authForm.phone }
          : {}),
      },
    });
    if (result.error) {
      const msg = result.error.includes("already registered")
        ? "Este correo ya está registrado. Intenta iniciar sesión."
        : result.error.includes("Invalid login")
          ? "Credenciales incorrectas"
          : result.error;
      toast.error(msg);
      setIsSubmitting(false);
      return;
    }
    clearWizardState();
    setIsSubmitting(false);
    setOrderSuccess(true);
    setTimeout(() => router.push("/cliente/tracking"), 2000);
  };

  const handlePrimaryAction = () => {
    if (step === 3 && isAuthenticated) {
      handleCreateOrder();
    } else if (step === 4) {
      handleCreateOrderWithAuth();
    } else if (step < totalSteps - 1) {
      goNext();
    }
  };

  /* ─── Primary button label ─── */

  const primaryLabel = (() => {
    if (isSubmitting) return null;
    if (step === 3 && isAuthenticated)
      return (
        <>
          <Check className="size-4" />
          Confirmar Pedido
        </>
      );
    if (step === 4)
      return authMode === "signup"
        ? "Crear cuenta y pedir"
        : "Iniciar sesión y pedir";
    return (
      <>
        Siguiente
        <ArrowRight className="size-4" />
      </>
    );
  })();

  /* ─── Render ─── */

  return (
    <div className="relative mx-auto max-w-lg px-4 pb-28 pt-6">
      {/* ── Success overlay ── */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          >
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

      {/* ── Progress indicator ── */}
      <div className="mb-2 flex items-center justify-center px-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Fragment key={i}>
            <motion.div
              layout
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </motion.div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  "mx-1.5 h-0.5 flex-1 rounded-full transition-colors duration-300",
                  i < step ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Paso {step + 1} de {totalSteps} —{" "}
        <span className="font-medium text-foreground">
          {STEP_LABELS[step]}
        </span>
      </p>

      {/* ── Step content ── */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
          {/* ─── Step 0: Cantidad ─── */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">
                  ¿Cuántos bidones necesitas?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bidones de 20 litros de agua purificada
                </p>
              </div>

              <Card className="border-0 shadow-md">
                <CardContent className="space-y-5 pt-4">
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
            </div>
          )}

          {/* ─── Step 1: Dirección ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">
                  ¿Dónde te los enviamos?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ingresa tu dirección de entrega
                </p>
              </div>

              <Card className="border-0 shadow-md">
                <CardContent className="space-y-4 pt-4">
                  <Label htmlFor="address" className="font-medium">
                    Dirección de entrega
                  </Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Ej: Av. Providencia 1234, depto 5B"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-12 pl-10 text-base"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <ShieldCheck className="size-4 shrink-0 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      Tu dirección se usa solo para la entrega y no se comparte
                      públicamente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Step 2: Método de pago ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">
                  ¿Cómo quieres pagar?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecciona tu método de pago preferido
                </p>
              </div>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!opt.enabled}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      paymentMethod === opt.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : opt.enabled
                          ? "border-border hover:border-primary/30 hover:bg-primary/[0.02]"
                          : "cursor-not-allowed border-border/50 opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-xl transition-colors",
                        paymentMethod === opt.id
                          ? "bg-primary/15"
                          : "bg-muted"
                      )}
                    >
                      <opt.icon
                        className={cn(
                          "size-6 transition-colors",
                          paymentMethod === opt.id
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-semibold",
                          paymentMethod === opt.id
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {opt.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                    {!opt.enabled && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Próximamente
                      </Badge>
                    )}
                    {paymentMethod === opt.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary"
                      >
                        <Check className="size-3.5 text-primary-foreground" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Step 3: Resumen ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">
                  Resumen de tu pedido
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revisa los detalles antes de confirmar
                </p>
              </div>

              <Card className="border-0 shadow-md">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="size-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Bidones 20L
                      </span>
                    </div>
                    <span className="font-semibold">
                      {cantidad} {cantidad === 1 ? "bidón" : "bidones"}
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Dirección
                      </span>
                    </div>
                    <span className="max-w-[200px] text-right text-sm font-medium leading-tight">
                      {address}
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="size-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Pago
                      </span>
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {paymentMethod}
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Entrega estimada
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      ~30 min
                    </span>
                  </div>

                  <div className="h-px bg-border" />

                  {discount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Subtotal
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCLP(subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          Descuento ({discount * 100}%)
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          -{formatCLP(subtotal - total)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCLP(total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
                  <User className="size-4 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    En el siguiente paso te pediremos un correo para confirmar
                    tu pedido.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 4: Auth ─── */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">
                  Último paso: identifícate
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Para confirmar tu pedido, necesitamos saber quién eres
                </p>
              </div>

              {/* Auth mode toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={cn(
                    "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                    authMode === "signup"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  Crear cuenta
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className={cn(
                    "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                    authMode === "signin"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  Ya tengo cuenta
                </button>
              </div>

              {/* Auth form */}
              <Card className="border-0 shadow-md">
                <CardContent className="space-y-4 pt-4">
                  <AnimatePresence mode="wait">
                    {authMode === "signup" ? (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="auth-name">Nombre completo</Label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="auth-name"
                              type="text"
                              placeholder="Juan Pérez"
                              value={authForm.name}
                              onChange={(e) =>
                                setAuthForm((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="auth-email">
                            Correo electrónico
                          </Label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="auth-email"
                              type="email"
                              placeholder="tu@correo.cl"
                              value={authForm.email}
                              onChange={(e) =>
                                setAuthForm((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="auth-phone">Teléfono</Label>
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              +56
                            </span>
                            <Input
                              id="auth-phone"
                              type="tel"
                              placeholder="9 1234 5678"
                              value={authForm.phone}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(
                                  /[^\d\s]/g,
                                  ""
                                );
                                setAuthForm((p) => ({
                                  ...p,
                                  phone: cleaned,
                                }));
                              }}
                              className="pl-[4.25rem]"
                              maxLength={12}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="auth-password">Contraseña</Label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="auth-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 6 caracteres"
                              value={authForm.password}
                              onChange={(e) =>
                                setAuthForm((p) => ({
                                  ...p,
                                  password: e.target.value,
                                }))
                              }
                              className="pl-10 pr-10"
                              minLength={6}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signin"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="auth-email-login">
                            Correo electrónico
                          </Label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="auth-email-login"
                              type="email"
                              placeholder="tu@correo.cl"
                              value={authForm.email}
                              onChange={(e) =>
                                setAuthForm((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                              className="pl-10"
                              autoFocus
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="auth-password-login">
                            Contraseña
                          </Label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="auth-password-login"
                              type={showPassword ? "text" : "password"}
                              placeholder="Tu contraseña"
                              value={authForm.password}
                              onChange={(e) =>
                                setAuthForm((p) => ({
                                  ...p,
                                  password: e.target.value,
                                }))
                              }
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground">
                Al continuar, aceptas nuestros{" "}
                <span className="underline">Términos de Servicio</span> y{" "}
                <span className="underline">Política de Privacidad</span>
              </p>
            </div>
          )}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 glass border-t border-border/50">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:py-5">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={isSubmitting}
              className="gap-1"
            >
              <ArrowLeft className="size-4" />
              Atrás
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handlePrimaryAction}
            disabled={!canProceed || isSubmitting}
            className={cn(
              "min-w-[160px] gap-2 rounded-full font-semibold shadow-lg shadow-primary/20",
              step === 3 &&
                isAuthenticated &&
                "bg-green-600 hover:bg-green-700 shadow-green-600/20"
            )}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
                className="size-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
              />
            ) : (
              primaryLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
