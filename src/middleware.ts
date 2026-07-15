import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// Routes that require authentication
const protectedPrefixes = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/timeline",
  "/documents",
  "/team",
  "/reports",
  "/settings",
];

// Routes only for unauthenticated users
const authRoutes = ["/login", "/register"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!(req.auth as { user?: unknown } | null)?.user;

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((r) => pathname.startsWith(r)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (protectedPrefixes.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}) as never;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|tab-icon-vaults.png|TechVaults-Logo-b2.png).*)",
  ],
};
