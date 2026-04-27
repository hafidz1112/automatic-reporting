import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const cookieHeader = request.headers.get("cookie") ?? "";
    const sessionResponse = await fetch(new URL("/api/auth/get-session", request.url), {
        method: "GET",
        headers: {
            cookie: cookieHeader,
        },
    });
    const sessionPayload = sessionResponse.ok ? await sessionResponse.json() : null;
    const sessionUser = sessionPayload?.user;

    if (!sessionUser) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && sessionUser.role !== "admin") {
        return NextResponse.redirect(new URL("/input-data", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/input-data/:path*", "/api/send-wa/:path*"]
};