# Implementación: Wizard "Pedir Ahora" - Flujo No Bloqueante

## Contexto y Razonamiento

### Problema identificado

El flujo original de "Pedir Ahora" presentaba una barrera de entrada significativa:

```
Usuario sin sesión → Clic en "Pedir Ahora" → Redirección a /login → Abandono
```

El middleware interceptaba cualquier intento de acceder a `/cliente` y redirigía inmediatamente a `/login`. El usuario nunca veía el formulario de pedido hasta completar el registro, lo cual genera fricción y abandono.

### Solución implementada

Se creó un flujo de pedido por pasos (wizard) en una ruta pública `/pedir` que permite configurar el pedido completo antes de solicitar autenticación:

```
Usuario → "Pedir Ahora" → /pedir (público)
  → Paso 1: Cantidad de bidones
  → Paso 2: Dirección de entrega  
  → Paso 3: Método de pago
  → Paso 4: Resumen del pedido
  → Paso 5: Registro/Login (solo si no hay sesión)
  → Pedido creado → /cliente/tracking
```

La autenticación se convierte en el **último paso** del proceso, no en un muro inicial. Si el usuario ya tiene sesión, el paso 5 se omite completamente.

---

## Cambios Implementados

### Archivos Creados (3)

| Archivo | Descripción |
|---------|-------------|
| `src/app/pedir/page.tsx` | Wizard completo de 5 pasos con: selector de cantidad, input de dirección, selector de método de pago, resumen, y formulario de auth inline |
| `src/app/pedir/layout.tsx` | Layout minimalista con header glass, logo Aguaya y botón "Volver" |
| `supabase/migrations/005_add_payment_method.sql` | Migración para agregar columna `payment_method` a la tabla `orders` |

### Archivos Modificados (4)

| Archivo | Cambio |
|---------|--------|
| `src/lib/supabase/middleware.ts` | Agregado `/pedir` a `publicRoutes` para permitir acceso sin autenticación |
| `src/lib/actions/order-actions.ts` | - `createOrder` ahora acepta `payment_method` opcional<br>- Nueva función `createOrderWithAuth` que combina signup/signin + creación de orden en una sola server action |
| `src/lib/types.ts` | - Nuevo tipo `PaymentMethod = "efectivo" \| "transferencia" \| "tarjeta"`<br>- Campo `payment_method?: string` agregado a interfaz `Order` |
| `src/app/page.tsx` | Todos los CTAs "Pedir Ahora" ahora apuntan a `/pedir` en lugar de `/cliente` |

---

## Características Implementadas

### 1. Wizard de 5 Pasos

| Paso | Contenido | Validación |
|------|-----------|------------|
| 1 - Cantidad | Selector 1-10 bidones con botones +/-, badges de descuento (5% para 3+, 10% para 5+), total en tiempo real | Siempre válido |
| 2 - Dirección | Input de texto para dirección de entrega | Dirección no vacía |
| 3 - Método de Pago | Cards seleccionables: Efectivo, Transferencia, Tarjeta (próximamente) | Método seleccionado |
| 4 - Resumen | Desglose completo: cantidad, dirección, pago, tiempo estimado, descuentos, total | Siempre válido |
| 5 - Cuenta | Tabs "Crear cuenta" / "Ya tengo cuenta" con formularios inline | Campos completos |

### 2. Persistencia Inteligente (localStorage)

- **F5 Refresh**: Los datos del wizard se preservan para no perder progreso accidentalmente
- **Navegación fuera**: Los datos se limpian al salir del wizard y volver (empieza de cero)
- **Mecanismo**: Flag en `sessionStorage` detecta si fue refresh o navegación

### 3. Auth Inline

- Registro y login se manejan dentro del wizard sin redirecciones
- `createOrderWithAuth` realiza auth + creación de orden en una sola request
- Mensajes de error traducidos (correo ya registrado, credenciales incorrectas)

### 4. Animaciones

- Transiciones slide horizontal entre pasos con Framer Motion
- `mode="popLayout"` para transiciones suaves sin layout shift
- Indicador de progreso con círculos numerados y líneas conectoras
- Overlay de éxito con confetti al confirmar pedido

### 5. Responsive Mobile-First

- `max-w-lg` para contenido centrado
- Bottom navigation fija con más padding en desktop (`py-3 md:py-5`)
- Botones full-width en pasos de acción

---

## Comportamiento por Tipo de Usuario

### Usuario sin sesión (5 pasos)
1. Configura todo el pedido
2. En el paso 5, crea cuenta o inicia sesión
3. El pedido se crea automáticamente después del auth
4. Redirección a `/cliente/tracking`

### Usuario con sesión (4 pasos)
1. Configura todo el pedido
2. El paso 5 (auth) se omite completamente
3. Clic en "Confirmar Pedido" en el resumen crea el pedido directamente
4. Redirección a `/cliente/tracking`

---

## To-Do Pendientes

### Alta Prioridad

| Item | Descripción | Impacto |
|------|-------------|---------|
| **Aplicar descuentos en backend** | Actualmente los descuentos (5% y 10%) se muestran en la UI pero `createOrder` calcula `total = cantidad * precio_unitario` sin aplicar descuento | El cliente ve un precio, pero se le cobra otro |
| **Migración de DB en producción** | Ejecutar `005_add_payment_method.sql` en Supabase de producción | Requerido para que funcione el wizard |

### Media Prioridad

| Item | Descripción |
|------|-------------|
| **Consolidar `/cliente` page** | La página `/cliente` aún tiene su propio formulario de pedido. Considerar redirigir a `/pedir` o simplificarla a solo mostrar historial |
| **Geolocalización GPS** | El paso de dirección tiene placeholder para GPS. Implementar autodetección de ubicación |
| **Validación de dirección** | Integrar Google Places o similar para autocompletar y validar direcciones |

### Baja Prioridad (Features Futuras)

| Item | Descripción |
|------|-------------|
| **Pasarela de pagos** | La opción "Tarjeta" está deshabilitada. Integrar Stripe, MercadoPago u otro |
| **Agendamiento** | El flujo actual es solo "entrega inmediata". Agregar opción de agendar para fecha/hora específica |
| **Botón cancelar pedido** | `cancelOrder` existe en el backend pero no hay UI para usarlo |

---

## Notas Técnicas

### Estructura del Estado del Wizard

```typescript
interface WizardState {
  step: number;
  cantidad: number;
  address: string;
  paymentMethod: "efectivo" | "transferencia" | "tarjeta" | null;
}
```

### Claves de Storage

- `aguaya_pending_order` - Datos del wizard en localStorage
- `aguaya_wizard_refresh` - Flag en sessionStorage para detectar F5 vs navegación

### Server Actions Relevantes

```typescript
// Crear orden (usuario autenticado)
createOrder({ cantidad_bidones, address, payment_method })

// Crear orden con auth inline (usuario nuevo)
createOrderWithAuth({ cantidad_bidones, address, payment_method, auth: { mode, email, password, name?, phone? } })
```

---

## Testing Recomendado

1. **Flujo completo sin sesión**: Ir a `/pedir`, completar wizard, crear cuenta, verificar pedido en tracking
2. **Flujo con sesión existente**: Login previo, ir a `/pedir`, verificar que paso 5 se omite
3. **Refresh en medio del wizard**: F5 en paso 3, verificar que datos se preservan
4. **Navegación y vuelta**: Ir a home desde paso 2, volver a `/pedir`, verificar que empieza de cero
5. **Descuentos visuales**: Seleccionar 3+ y 5+ bidones, verificar badges y cálculo de total
6. **Responsive**: Probar en mobile y desktop, verificar bottom nav y padding
