"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Droplets,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Truck,
  ShieldCheck,
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // MVP: simulate login delay then redirect
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push("/cliente");
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-10">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />
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
            Agua pura, al instante
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass border-white/40 shadow-xl shadow-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
              <CardDescription>
                Inicia sesion para pedir tu agua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contrasena"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Login Button */}
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
                      Iniciar Sesion
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Links */}
              <div className="mt-5 flex flex-col items-center gap-2 text-sm">
                <p className="text-muted-foreground">
                  No tienes cuenta?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    Registrate
                  </Link>
                </p>
                <Link
                  href="/register?role=repartidor"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Eres repartidor? Registrate aqui
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              Acceso demo
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="group flex h-auto flex-col gap-2 rounded-xl border-white/60 bg-white/50 py-4 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-md"
              onClick={() => router.push("/cliente")}
            >
              <User className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-xs font-medium">Entrar como Cliente</span>
            </Button>

            <Button
              variant="outline"
              className="group flex h-auto flex-col gap-2 rounded-xl border-white/60 bg-white/50 py-4 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-md"
              onClick={() => router.push("/repartidor")}
            >
              <Truck className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-xs font-medium">
                Entrar como Repartidor
              </span>
            </Button>

            <Button
              variant="outline"
              className="group flex h-auto flex-col gap-2 rounded-xl border-white/60 bg-white/50 py-4 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-md"
              onClick={() => router.push("/admin")}
            >
              <ShieldCheck className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-xs font-medium">Entrar como Admin</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
