import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isLoggedIn = !!sessionToken;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isPublicApi = pathname.startsWith("/api/weather") ||
    pathname.startsWith("/api/menu");

  if (isApiAuth || isPublicApi) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isDashboard && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
