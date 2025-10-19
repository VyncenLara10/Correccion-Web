import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;

// Verifica el token emitido por Auth0
export async function verifyAuth0Token(token: string) {
  const secret = new TextEncoder().encode(process.env.AUTH0_CLIENT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: `${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE,
    });
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Obtiene la sesión desde la cookie
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  if (!token) return null;

  return await verifyAuth0Token(token.value);
}

// Middleware de protección
export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await verifyAuth0Token(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  return payload;
}
