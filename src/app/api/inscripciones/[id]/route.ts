import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verificarSesion, AUTH_COOKIE } from "@/lib/auth";

// Elimina un colaborador (sus acompañantes se borran en cascada por la FK).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!(await verificarSesion(token)))
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("colaboradores").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "No se pudo eliminar el colaborador." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
