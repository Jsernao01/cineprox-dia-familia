"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calcularAntiguedadMeses, MESES } from "@/lib/utils";
import { SEDES, ESTADOS_CIVILES, PARENTESCOS, PARENTESCO_CONYUGE, EDAD_MENOR, type EstadoCivil } from "@/lib/constants";
import { alertaAdvertencia, alertaError, alertaExito } from "@/lib/alerts";
import { Spinner } from "@/components/Spinner";

type Genero = "masculino" | "femenino" | "";
interface Acomp {
  id: number;
  categoria: string;
  edad: string;
  genero: Genero;
}

const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 1990 + 1 }, (_, i) => ANIO_ACTUAL - i);

let acompId = 1;
const nuevoAcomp = (): Acomp => ({ id: acompId++, categoria: "", edad: "", genero: "" });

export default function InscripcionPage() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [sede, setSede] = useState("");
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivil | "">("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [asistencia, setAsistencia] = useState<"" | "solo" | "acompanado">("");
  const [acompanantes, setAcompanantes] = useState<Acomp[]>([]);
  const [enviando, setEnviando] = useState(false);

  const antiguedad = useMemo(() => {
    if (!mes || !anio) return null;
    return calcularAntiguedadMeses(Number(mes), Number(anio));
  }, [mes, anio]);

  const soloUno = estadoCivil === "soltero_sin_hijos"; // límite exacto de 1
  const pideParentesco = estadoCivil === "casado_union_libre";

  function reset() {
    setNombre(""); setCedula(""); setSede(""); setEstadoCivil("");
    setMes(""); setAnio(""); setAsistencia(""); setAcompanantes([]);
  }

  function actualizar(id: number, campo: keyof Acomp, valor: string) {
    setAcompanantes((a) => a.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));
  }

  // Ajusta las tarjetas según asistencia + estado civil
  function ajustar(asis: "" | "solo" | "acompanado", estado: EstadoCivil | "") {
    if (asis !== "acompanado" || estado === "") {
      setAcompanantes([]);
      return;
    }
    setAcompanantes((prev) => {
      if (estado === "soltero_sin_hijos") {
        return prev.length >= 1 ? [prev[0]] : [nuevoAcomp()];
      }
      return prev.length >= 1 ? prev : [nuevoAcomp()];
    });
  }

  function seleccionarAsistencia(v: "solo" | "acompanado") {
    setAsistencia(v);
    ajustar(v, estadoCivil);
  }

  function cambiarEstadoCivil(v: string) {
    const e = v as EstadoCivil | "";
    setEstadoCivil(e);
    ajustar(asistencia, e);
  }

  function agregarAcompanante() {
    setAcompanantes((a) => [...a, nuevoAcomp()]);
  }
  function eliminarAcompanante(id: number) {
    setAcompanantes((a) => a.filter((x) => x.id !== id));
  }

  function validarCliente(): string | null {
    if (!nombre.trim()) return "Ingrese el nombre completo del colaborador.";
    if (!cedula.trim()) return "Ingrese el número de cédula.";
    if (!sede) return "Seleccione la sede a la que pertenece.";
    if (!estadoCivil) return "Seleccione el estado civil.";
    if (!mes || !anio) return "Seleccione el mes y año de ingreso.";
    if (!asistencia) return "Indique si asistirá solo o acompañado.";
    if (asistencia === "acompanado") {
      if (acompanantes.length === 0) return "Agregue al menos un acompañante.";
      if (soloUno && acompanantes.length !== 1)
        return "Si es soltero sin hijos solo puede registrar 1 acompañante.";
      for (const a of acompanantes) {
        const e = Number(a.edad);
        if (a.edad === "" || Number.isNaN(e)) return "Ingrese la edad de cada acompañante.";
        if (e < 0) return "La edad no puede ser negativa.";
        if (e > 120) return "La edad no puede superar 120 años.";
        if (e <= EDAD_MENOR && !a.genero) return `Seleccione el género de los menores de ${EDAD_MENOR} años.`;
        if (pideParentesco && !a.categoria) return "Seleccione el parentesco de cada acompañante.";
      }
      const conyuges = acompanantes.filter((a) => a.categoria === PARENTESCO_CONYUGE).length;
      if (conyuges > 1) return "Solo puede registrar un cónyuge/compañero(a) permanente.";
    }
    return null;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const v = validarCliente();
    if (v) { alertaAdvertencia(v); return; }

    setEnviando(true);
    try {
      const payload = {
        nombre_completo: nombre.trim(),
        cedula: cedula.trim(),
        sede,
        estado_civil: estadoCivil,
        ingreso_mes: Number(mes),
        ingreso_anio: Number(anio),
        asistencia,
        acompanantes:
          asistencia === "acompanado"
            ? acompanantes.map((a) => ({
              categoria: pideParentesco ? a.categoria : "",
              edad: Number(a.edad),
              genero: Number(a.edad) <= EDAD_MENOR ? a.genero : null,
            }))
            : [],
      };
      const res = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { alertaError(json.error || "No se pudo enviar la inscripción."); return; }
      reset();
      alertaExito("Tu inscripción al Día de la Familia CineProx fue registrada correctamente.");
    } catch {
      alertaError("Error de conexión. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="relative min-h-screen py-8">
      {/* Fondo: degradado violeta de marca + imagen difuminada */}
      <div
        className="fixed inset-0 -z-20"
        style={{ background: "radial-gradient(circle at 50% 25%, #3d0d70 0%, #24073f 45%, #120324 100%)" }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 scale-125 bg-cover bg-center opacity-55 blur-2xl"
        style={{ backgroundImage: "url('/fondo.jpg')" }}
        aria-hidden
      />

      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
            ← Volver
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cineprox-white.png" alt="CineProx" className="h-6 w-auto" />
        </div>

        <form onSubmit={enviar} className="space-y-6">
          {/* Datos del colaborador */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Información del colaborador</h2>
            <div className="grid gap-4">
              <Field label="Nombre completo">
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={inputCls}
                  placeholder="Nombre y apellidos"
                />
              </Field>
              <Field label="Número de cédula">
                <input
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="Ingreselo sin puntos ni comas"
                />
              </Field>

              <Field label="Sede a la que pertenece">
                <select value={sede} onChange={(e) => setSede(e.target.value)} className={inputCls}>
                  <option value="">Seleccione su sede</option>
                  {SEDES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Estado civil">
                <select
                  value={estadoCivil}
                  onChange={(e) => cambiarEstadoCivil(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Seleccione</option>
                  {ESTADOS_CIVILES.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </Field>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Fecha de ingreso
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select value={mes} onChange={(e) => setMes(e.target.value)} className={inputCls}>
                    <option value="">Mes</option>
                    {MESES.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select value={anio} onChange={(e) => setAnio(e.target.value)} className={inputCls}>
                    <option value="">Año</option>
                    {ANIOS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Field label="Tiempo de antigüedad">
                <input
                  readOnly
                  value={antiguedad === null ? "" : `${antiguedad} meses`}
                  className={`${inputCls} cursor-default bg-slate-50 text-slate-600`}
                />
              </Field>
            </div>
          </section>

          {/* Asistencia */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Asistencia</h2>
            <p className="mb-3 text-sm text-slate-600">¿Asistirá solo o acompañado?</p>
            <div className="grid grid-cols-2 gap-3">
              <RadioCard
                active={asistencia === "solo"}
                onClick={() => seleccionarAsistencia("solo")}
                title="Solo"
                desc="Asistiré sin acompañantes"
              />
              <RadioCard
                active={asistencia === "acompanado"}
                onClick={() => seleccionarAsistencia("acompanado")}
                title="Acompañado"
                desc="Registraré acompañantes"
              />
            </div>

            {asistencia === "acompanado" && !estadoCivil && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Seleccione primero su estado civil para registrar acompañantes.
              </p>
            )}

            {asistencia === "acompanado" && estadoCivil && (
              <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
                {estadoCivil === "soltero_con_hijos" && "Solo puede asistir con sus hijos como acompañantes."}
                {estadoCivil === "soltero_sin_hijos" && "Puedes registrar a 1 acompañante."}
                {estadoCivil === "casado_union_libre" && "Puede registrar a su cónyuge/compañero(a) permanente e hijos. Indique el parentesco de cada uno."}
              </p>
            )}
          </section>

          {/* Acompañantes */}
          {asistencia === "acompanado" && estadoCivil && acompanantes.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {estadoCivil === "soltero_con_hijos" ? "Hijos" : "Acompañantes"}
                </h2>
                <span className="text-xs font-medium text-slate-500">{acompanantes.length} en total</span>
              </div>

              <div className="space-y-4">
                {acompanantes.map((a, idx) => {
                  const edadNum = Number(a.edad);
                  const esMenor = a.edad !== "" && !Number.isNaN(edadNum) && edadNum <= EDAD_MENOR;
                  const conyugeTomadoPorOtro = acompanantes.some(
                    (x) => x.id !== a.id && x.categoria === PARENTESCO_CONYUGE
                  );
                  const titulo =
                    estadoCivil === "soltero_con_hijos" ? `Hijo(a) ${idx + 1}` : `Acompañante ${idx + 1}`;
                  return (
                    <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{titulo}</span>
                        {!soloUno && acompanantes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarAcompanante(a.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {pideParentesco && (
                          <Field label="Parentesco">
                            <select
                              value={a.categoria}
                              onChange={(e) => actualizar(a.id, "categoria", e.target.value)}
                              className={inputCls}
                            >
                              <option value="">Seleccione</option>
                              {PARENTESCOS.map((p) => {
                                const bloqueado = p === PARENTESCO_CONYUGE && conyugeTomadoPorOtro;
                                return (
                                  <option key={p} value={p} disabled={bloqueado}>
                                    {p}{bloqueado ? "" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </Field>
                        )}
                        <Field label="Edad">
                          <input
                            value={a.edad}
                            onChange={(e) =>
                              actualizar(a.id, "edad", e.target.value.replace(/[^0-9]/g, ""))
                            }
                            inputMode="numeric"
                            className={inputCls}
                            placeholder="Años"
                          />
                        </Field>
                        {esMenor && (
                          <Field label="Género">
                            <select
                              value={a.genero}
                              onChange={(e) => actualizar(a.id, "genero", e.target.value)}
                              className={inputCls}
                            >
                              <option value="">Seleccione</option>
                              <option value="masculino">Masculino</option>
                              <option value="femenino">Femenino</option>
                            </select>
                          </Field>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!soloUno && (
                <button
                  type="button"
                  onClick={agregarAcompanante}
                  className="mt-4 w-full rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
                >
                  {estadoCivil === "soltero_con_hijos" ? "+ Agregar hijo(a)" : "+ Agregar acompañante"}
                </button>
              )}
            </section>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-70"
          >
            {enviando && <Spinner className="h-5 w-5" />}
            {enviando ? "Enviando…" : "Enviar inscripción"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function RadioCard({
  active, onClick, title, desc,
}: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${active
        ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
        : "border-slate-200 bg-white hover:border-slate-300"
        }`}
    >
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
    </button>
  );
}
