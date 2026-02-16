import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aguaya - Delivery Ultra Rápido de Agua Purificada",
  description:
    "Bidones de 20L de agua purificada a tu puerta en menos de 30 minutos. Pide con un click.",
  keywords: ["agua purificada", "delivery", "bidones", "Chile", "aguaya"],
  openGraph: {
    title: "Aguaya - Agua Pura, Al Instante",
    description: "Bidones de 20L de agua purificada a tu puerta en menos de 30 minutos.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0046FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
