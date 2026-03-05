import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'aguaya' },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes - no auth needed
  const publicRoutes = ["/", "/login", "/register", "/pedir"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );

  // If not authenticated and trying to access protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If authenticated, check role-based access
  if (user) {
    const role = user.user_metadata?.role || "cliente";

    // Redirect authenticated users away from auth pages
    if (pathname === "/login" || pathname === "/register") {
      const url = request.nextUrl.clone();
      if (role === "admin") url.pathname = "/admin";
      else if (role === "repartidor") url.pathname = "/repartidor";
      else url.pathname = "/cliente";
      return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "repartidor" ? "/repartidor" : "/cliente";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/repartidor") && role === "cliente") {
      const url = request.nextUrl.clone();
      url.pathname = "/cliente";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
