import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "./supabaseAdmin";

// Lee si las inscripciones están abiertas. Ante cualquier error, asume abiertas
// (falla en modo "abierto" para no bloquear por un problema puntual de red).
export async function getInscripcionesAbiertas(): Promise<boolean> {
  noStore(); // nunca cachear: siempre leer el estado actual de la base
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("configuracion")
      .select("inscripciones_abiertas")
      .eq("id", 1)
      .single();
    if (error || !data) return true;
    return data.inscripciones_abiertas !== false;
  } catch {
    return true;
  }
}

export async function setInscripcionesAbiertas(abiertas: boolean): Promise<boolean> {
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("configuracion")
      .upsert({ id: 1, inscripciones_abiertas: abiertas, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}
