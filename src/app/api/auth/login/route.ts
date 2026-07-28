import { NextResponse } from "next/server";
import { credencialesValidas, crearSesion, AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, password } = await req.json().catch(() => ({}));
  if (typeof user !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  if (!credencialesValidas(user, password)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }
  const token = await crearSesion(user);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
