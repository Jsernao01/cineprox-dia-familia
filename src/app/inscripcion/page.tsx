"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calcularAntiguedadMeses, MESES } from "@/lib/utils";

type Genero = "masculino" | "femenino" | "";
interface Acomp {
  id: number;
  edad: string;
  genero: Genero;
}

const MAX_ACOMP = 7;
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 1990 + 1 }, (_, i) => ANIO_ACTUAL - i);

let acompId = 1;

export default function InscripcionPage() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [asistencia, setAsistencia] = useState<"" | "solo" | "acompanado">("");
  const [cantidad, setCantidad] = useState("");
  const [acompanantes, setAcompanantes] = useState<Acomp[]>([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const antiguedad = useMemo(() => {
    if (!mes || !anio) return null;
    return calcularAntiguedadMeses(Number(mes), Number(anio));
  }, [mes, anio]);

  function reset() {
    setNombre(""); setCedula(""); setMes(""); setAnio("");
    setAsistencia(""); setCantidad(""); setAcompanantes([]); setError("");
  }

  function actualizar(id: number, campo: keyof Acomp, valor: string) {
    setAcompanantes((a) => a.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));
  }

  // Ajusta el número de tarjetas según la cantidad elegida (conserva lo ya escrito)
  function elegirCantidad(valor: string) {
    setCantidad(valor);
    const n = Number(valor);
    setAcompanantes((prev) => {
      const next: Acomp[] = [];
      for (let i = 0; i < n; i++) {
        next.push(prev[i] ?? { id: acompId++, edad: "", genero: "" });
      }
      return next;
    });
  }

  function seleccionarAsistencia(v: "solo" | "acompanado") {
    setAsistencia(v);
    if (v === "solo") {
      setCantidad("");
      setAcompanantes([]);
    }
  }

  function validarCliente(): string | null {
    if (!nombre.trim()) return "Ingrese el nombre completo del colaborador.";
    if (!cedula.trim()) return "Ingrese el número de cédula.";
    if (!mes || !anio) return "Seleccione el mes y año de ingreso.";
    if (!asistencia) return "Indique si asistirá solo o acompañado.";
    if (asistencia === "acompanado") {
      if (!cantidad) return "Indique cuántos acompañantes registrará.";
      if (acompanantes.length < 1 || acompanantes.length > MAX_ACOMP)
        return `La cantidad de acompañantes debe estar entre 1 y ${MAX_ACOMP}.`;
      for (const a of acompanantes) {
        const e = Number(a.edad);
        if (a.edad === "" || Number.isNaN(e)) return "Ingrese la edad de cada acompañante.";
        if (e < 0) return "La edad no puede ser negativa.";
        if (e > 120) return "La edad no puede superar 120 años.";
        if (e <= 14 && !a.genero) return "Seleccione el género de los menores de 14 años.";
      }
    }
    return null;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const v = validarCliente();
    if (v) { setError(v); return; }

    setEnviando(true);
    try {
      const payload = {
        nombre_completo: nombre.trim(),
        cedula: cedula.trim(),
        ingreso_mes: Number(mes),
        ingreso_anio: Number(anio),
        asistencia,
        acompanantes:
          asistencia === "acompanado"
            ? acompanantes.map((a, idx) => ({
              nombre_completo: `Acompañante ${idx + 1}`,
              edad: Number(a.edad),
              genero: Number(a.edad) <= 14 ? a.genero : null,
            }))
            : [],
      };
      const res = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "No se pudo enviar la inscripción."); return; }
      setExito(true);
      reset();
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-slate-900">¡Inscripción registrada!</h1>
          <p className="mt-2 text-sm text-slate-600">
            Gracias por registrarte al Día de la Familia CineProx. Tu información fue guardada
            correctamente.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => setExito(false)}
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Registrar otra inscripción
            </button>
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Volver
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cineprox-transparent.png" alt="CineProx" className="h-6 w-auto" />
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

            {/* Cantidad de acompañantes */}
            {asistencia === "acompanado" && (
              <div className="mt-5">
                <Field label={`¿Cuántos acompañantes? (máximo ${MAX_ACOMP})`}>
                  <select
                    value={cantidad}
                    onChange={(e) => elegirCantidad(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Seleccione</option>
                    {Array.from({ length: MAX_ACOMP }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </section>

          {/* Acompañantes */}
          {asistencia === "acompanado" && acompanantes.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Datos de los acompañantes</h2>
                <span className="text-xs font-medium text-slate-500">{acompanantes.length} en total</span>
              </div>

              <div className="space-y-4">
                {acompanantes.map((a, idx) => {
                  const edadNum = Number(a.edad);
                  const esMenor = a.edad !== "" && !Number.isNaN(edadNum) && edadNum <= 14;
                  return (
                    <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3">
                        <span className="text-sm font-semibold text-slate-700">
                          Acompañante {idx + 1}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
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
            </section>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60"
          >
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
