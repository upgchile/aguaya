"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Truck,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "cliente" | "repartidor";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role") as Role | null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>(
    preselectedRole === "repartidor" ? "repartidor" : "cliente"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // MVP: simulate registration delay then redirect based on role
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push(role === "repartidor" ? "/repartidor" : "/cliente");
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-10">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <Droplets className="size-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Aguaya</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Crea tu cuenta en segundos
          </p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass border-white/40 shadow-xl shadow-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Crear cuenta</CardTitle>
              <CardDescription>
                Unete a Aguaya y recibe agua purificada al instante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                {/* Role Selector */}
                <div className="flex flex-col gap-2">
                  <Label>Tipo de cuenta</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("cliente")}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all ${
                        role === "cliente"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-white/50 hover:border-primary/30 hover:bg-primary/[0.02]"
                      }`}
                    >
                      <AnimatePresence>
                        {role === "cliente" && (
                          <motion.div
                            layoutId="role-indicator"
                            className="absolute inset-0 rounded-xl border-2 border-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </AnimatePresence>
                      <User
                        className={`relative z-10 size-6 transition-colors ${
                          role === "cliente"
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary/60"
                        }`}
                      />
                      <div className="relative z-10 text-center">
                        <p
                          className={`text-sm font-semibold ${
                            role === "cliente"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          Cliente
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Quiero pedir agua
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("repartidor")}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all ${
                        role === "repartidor"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-white/50 hover:border-primary/30 hover:bg-primary/[0.02]"
                      }`}
                    >
                      <AnimatePresence>
                        {role === "repartidor" && (
                          <motion.div
                            layoutId="role-indicator"
                            className="absolute inset-0 rounded-xl border-2 border-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </AnimatePresence>
                      <Truck
                        className={`relative z-10 size-6 transition-colors ${
                          role === "repartidor"
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary/60"
                        }`}
                      />
                      <div className="relative z-10 text-center">
                        <p
                          className={`text-sm font-semibold ${
                            role === "repartidor"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          Repartidor
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Quiero repartir
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Perez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      +56
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9 1234 5678"
                      value={phone}
                      onChange={(e) => {
                        // Only allow digits and spaces
                        const cleaned = e.target.value.replace(/[^\d\s]/g, "");
                        setPhone(cleaned);
                      }}
                      className="pl-[4.25rem]"
                      maxLength={12}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Register Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full rounded-xl font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                      className="size-5 rounded-full border-2 border-primary-foreground border-t-transparent"
                    />
                  ) : (
                    <>
                      Crear Cuenta
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Link to login */}
              <div className="mt-5 flex flex-col items-center gap-2 text-sm">
                <p className="text-muted-foreground">
                  Ya tienes cuenta?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Inicia Sesion
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          Al registrarte, aceptas nuestros{" "}
          <Link href="#" className="underline hover:text-primary">
            Terminos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="#" className="underline hover:text-primary">
            Politica de Privacidad
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
