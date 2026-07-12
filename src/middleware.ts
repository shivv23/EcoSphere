import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isPublic = req.nextUrl.pathname === "/";

  if (isApiRoute || isAuthPage || isPublic) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|_not-found|favicon.ico).*)"],
};
