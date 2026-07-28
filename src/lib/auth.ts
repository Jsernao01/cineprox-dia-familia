import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "cineprox_admin";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET en variables de entorno.");
  return new TextEncoder().encode(secret);
}

/** Crea un JWT de sesión firmado (válido 8 horas). */
export async function crearSesion(user: string): Promise<string> {
  return new SignJWT({ user, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

/** Verifica el token; devuelve el payload o null. */
export async function verificarSesion(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

/** Valida usuario/contraseña contra las variables de entorno. */
export function credencialesValidas(user: string, password: string): boolean {
  const U = process.env.ADMIN_USER;
  const P = process.env.ADMIN_PASSWORD;
  if (!U || !P) return false;
  // Comparación de longitud constante básica
  return safeEqual(user, U) && safeEqual(password, P);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export const AUTH_COOKIE = COOKIE_NAME;
