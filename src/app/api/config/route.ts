import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarSesion, AUTH_COOKIE } from "@/lib/auth";
import { getInscripcionesAbiertas, setInscripcionesAbiertas } from "@/lib/config";

export const dynamic = "force-dynamic";

// Público: estado actual
export async function GET() {
  const abiertas = await getInscripcionesAbiertas();
  return NextResponse.json({ abiertas });
}

// Protegido: cambiar estado (abrir/cerrar)
export async function PATCH(req: Request) {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!(await verificarSesion(token)))
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const abiertas = body?.abiertas === true;
  const ok = await setInscripcionesAbiertas(abiertas);
  if (!ok) return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  return NextResponse.json({ ok: true, abiertas });
}
