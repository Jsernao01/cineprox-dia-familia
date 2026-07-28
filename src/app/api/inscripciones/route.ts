import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { calcularAntiguedadMeses } from "@/lib/utils";
import { verificarSesion, AUTH_COOKIE } from "@/lib/auth";
import type { InscripcionInput } from "@/lib/types";
import { SEDES, PARENTESCOS } from "@/lib/constants";
import { cookies } from "next/headers";

const ESTADOS = ["soltero_con_hijos", "soltero_sin_hijos", "otro"] as const;

// ---------- Validación en servidor ----------
function validar(body: any): { ok: true; data: InscripcionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Cuerpo inválido." };

  const nombre = String(body.nombre_completo ?? "").trim();
  const cedula = String(body.cedula ?? "").trim();
  const sede = String(body.sede ?? "").trim();
  const estadoCivil = body.estado_civil;
  const mes = Number(body.ingreso_mes);
  const anio = Number(body.ingreso_anio);
  const asistencia = body.asistencia;

  if (!nombre) return { ok: false, error: "El nombre del colaborador es obligatorio." };
  if (!cedula) return { ok: false, error: "La cédula es obligatoria." };
  if (!sede || !SEDES.includes(sede as any)) return { ok: false, error: "Seleccione una sede válida." };
  if (!ESTADOS.includes(estadoCivil)) return { ok: false, error: "Seleccione el estado civil." };
  if (!(mes >= 1 && mes <= 12)) return { ok: false, error: "Mes de ingreso inválido." };
  if (!(anio >= 1980 && anio <= 2100)) return { ok: false, error: "Año de ingreso inválido." };
  if (asistencia !== "solo" && asistencia !== "acompanado")
    return { ok: false, error: "Debe indicar si asiste solo o acompañado." };

  let acompanantes: any[] = Array.isArray(body.acompanantes) ? body.acompanantes : [];
  if (asistencia === "solo") acompanantes = [];

  if (asistencia === "acompanado") {
    if (acompanantes.length === 0)
      return { ok: false, error: "Debe registrar al menos un acompañante." };
    if (estadoCivil === "soltero_sin_hijos" && acompanantes.length !== 1)
      return { ok: false, error: "Solo puedes registrar 1 acompañante" };
  }

  const conCategoria = (a: any): string => {
    if (estadoCivil === "soltero_con_hijos") return "Hijo(a)";
    if (estadoCivil === "soltero_sin_hijos") return "Acompañante";
    return String(a?.categoria ?? "").trim(); // otro
  };

  const salida: InscripcionInput["acompanantes"] = [];
  acompanantes.forEach((a, i) => {
    const edad = Number(a?.edad);
    if (!Number.isFinite(edad) || edad < 0) throw new ValidacionError("La edad no puede ser negativa.");
    if (edad > 120) throw new ValidacionError("La edad no puede superar 120 años.");
    if (edad <= 14 && a?.genero !== "masculino" && a?.genero !== "femenino")
      throw new ValidacionError("Indique el género de los menores de 14 años.");
    const categoria = conCategoria(a);
    if (estadoCivil === "otro" && !PARENTESCOS.includes(categoria as any))
      throw new ValidacionError("Seleccione el parentesco de cada acompañante.");
    salida.push({
      nombre_completo: `Acompañante ${i + 1}`,
      categoria,
      edad,
      genero: edad <= 14 ? (a.genero as any) : null,
    });
  });

  return {
    ok: true,
    data: {
      nombre_completo: nombre,
      cedula,
      sede,
      estado_civil: estadoCivil,
      ingreso_mes: mes,
      ingreso_anio: anio,
      asistencia,
      acompanantes: salida,
    },
  };
}

class ValidacionError extends Error { }

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  let parsed;
  try {
    parsed = validar(body);
  } catch (e) {
    if (e instanceof ValidacionError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data } = parsed;
  const antiguedad = calcularAntiguedadMeses(data.ingreso_mes, data.ingreso_anio);

  // Insertar colaborador
  const { data: colab, error: colabErr } = await supabase
    .from("colaboradores")
    .insert({
      nombre_completo: data.nombre_completo,
      cedula: data.cedula,
      sede: data.sede,
      estado_civil: data.estado_civil,
      ingreso_mes: data.ingreso_mes,
      ingreso_anio: data.ingreso_anio,
      antiguedad_meses: antiguedad,
      asistencia: data.asistencia,
    })
    .select()
    .single();

  if (colabErr) {
    if ((colabErr as any).code === "23505") {
      return NextResponse.json(
        { error: "Ya existe una inscripción con esta cédula." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo guardar la inscripción." }, { status: 500 });
  }

  // Insertar acompañantes
  if (data.acompanantes.length > 0) {
    const rows = data.acompanantes.map((a) => ({
      colaborador_id: colab.id,
      nombre_completo: a.nombre_completo,
      categoria: a.categoria ?? null,
      edad: a.edad,
      genero: a.genero ?? null,
    }));
    const { error: accErr } = await supabase.from("acompanantes").insert(rows);
    if (accErr) {
      await supabase.from("colaboradores").delete().eq("id", colab.id);
      return NextResponse.json({ error: "No se pudieron guardar los acompañantes." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id: colab.id, antiguedad_meses: antiguedad });
}

// GET protegido: lista colaboradores + acompañantes
export async function GET() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  const session = await verificarSesion(token);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("colaboradores")
    .select("*, acompanantes(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Error al consultar." }, { status: 500 });
  return NextResponse.json({ data });
}
