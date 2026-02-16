# Aguaya - Delivery Ultra Rápido de Agua Purificada

## Project Overview
Marketplace connecting water bidón customers with nearby delivery drivers (Uber model for water).

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Auth/DB/Realtime**: Supabase
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **Font**: Outfit (Google Fonts)
- **Deploy target**: Vercel

## Project Structure
- `src/app/` - Next.js App Router pages
  - `(auth)/` - Login/Register (public)
  - `cliente/` - Customer dashboard
  - `repartidor/` - Driver dashboard
  - `admin/` - Admin panel
- `src/components/ui/` - shadcn/ui components
- `src/lib/` - Utilities, types, Supabase client
- `supabase/migrations/` - Database schema

## Design System
- Primary: #0046FF (Electric Blue)
- Font: Outfit
- Style: Glassmorphism subtle
- Mobile-first for cliente/repartidor, desktop-first for admin

## Key Constants
- Precio bidón: $4.500 CLP
- Comisión plataforma: $500/bidón
- Pago repartidor: $3.000/bidón

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint
