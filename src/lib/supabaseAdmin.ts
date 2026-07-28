import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para uso EXCLUSIVO en el servidor.
 * Usa la service_role key, por lo que ignora RLS. Nunca importar
 * este módulo en componentes de cliente.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // No lanzamos en import para permitir el build sin envs;
  // fallará de forma clara en tiempo de ejecución si faltan.
  console.warn("[supabaseAdmin] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
}

export function getSupabaseAdmin() {
  if (!url || !serviceKey) {
    throw new Error("Configuración de Supabase incompleta. Revisa las variables de entorno.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
