import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/login", "/register", "/forgot-password", "/"]
const backendUrl = "http://localhost:8000"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths tanpa auth
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for auth token di cookies
  const token = request.cookies.get("auth-token")?.value

  // Protect dashboard routes - redirect to login if no token
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Kalau request ke /api, forward ke backend
  if (pathname.startsWith("/api")) {
    const target = backendUrl + pathname
    const response = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })

    const data = await response.text()
    return new NextResponse(data, {
      status: response.status,
      headers: response.headers,
    })
  }

  // Default: lanjutkan ke FE
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)"],
}
