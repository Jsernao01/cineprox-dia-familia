import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verificarSesion, AUTH_COOKIE } from "@/lib/auth";

// Elimina un acompañante individual.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!(await verificarSesion(token)))
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("acompanantes").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "No se pudo eliminar el acompañante." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
