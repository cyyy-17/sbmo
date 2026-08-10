import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
  
  if (isApiAuthRoute) return null

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
    return null
  }

  if (!isLoggedIn) {
    let callbackUrl = req.nextUrl.pathname
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.nextUrl))
  }

  return null
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
