"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import type { Colaborador } from "@/lib/types";
import { calcularStats } from "@/lib/stats";
import { exportarExcel } from "@/lib/exportExcel";
import { formatearFecha, nombreMes } from "@/lib/utils";
import { labelEstadoCivil } from "@/lib/constants";
import { confirmarEliminar, alertaError, toastExito } from "@/lib/alerts";
import { Spinner } from "@/components/Spinner";

type SortKey = "nombre_completo" | "cedula" | "antiguedad_meses" | "acompanantes" | "created_at";
const PAGE_SIZE = 8;
const COLORS_BAR = ["#BB82F7", "#901CEB", "#620FA3"];
const COLORS_GENERO = ["#901CEB", "#EC4899"];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Tabla
  const [busqueda, setBusqueda] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [detalle, setDetalle] = useState<Colaborador | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/inscripciones");
        if (res.status === 401) { router.push("/admin/login"); return; }
        const json = await res.json();
        if (!res.ok) { setErrorMsg(json.error || "Error al cargar."); return; }
        setData(json.data || []);
      } catch {
        setErrorMsg("Error de conexión.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const stats = useMemo(() => calcularStats(data), [data]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let rows = data;
    if (q) {
      rows = rows.filter(
        (c) =>
          c.nombre_completo.toLowerCase().includes(q) ||
          c.cedula.toLowerCase().includes(q)
      );
    }
    const arr = [...rows].sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortKey) {
        case "acompanantes":
          av = a.acompanantes?.length ?? 0; bv = b.acompanantes?.length ?? 0; break;
        case "antiguedad_meses":
          av = a.antiguedad_meses; bv = b.antiguedad_meses; break;
        case "cedula":
          av = a.cedula; bv = b.cedula; break;
        case "nombre_completo":
          av = a.nombre_completo.toLowerCase(); bv = b.nombre_completo.toLowerCase(); break;
        default:
          av = a.created_at; bv = b.created_at;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, busqueda, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtrados.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
    setPage(1);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function eliminarColaborador(id: string) {
    const ok = await confirmarEliminar(
      "¿Eliminar colaborador?",
      "Se eliminará el registro completo junto con todos sus acompañantes. Esta acción no se puede deshacer."
    );
    if (!ok) return;
    const res = await fetch(`/api/inscripciones/${id}`, { method: "DELETE" });
    if (!res.ok) { alertaError("No se pudo eliminar el colaborador."); return; }
    setData((d) => d.filter((c) => c.id !== id));
    setDetalle(null);
    toastExito("Colaborador eliminado");
  }

  async function eliminarAcompanante(colaboradorId: string, acompananteId: string) {
    const ok = await confirmarEliminar("¿Eliminar acompañante?", "Esta acción no se puede deshacer.");
    if (!ok) return;
    const res = await fetch(`/api/acompanantes/${acompananteId}`, { method: "DELETE" });
    if (!res.ok) { alertaError("No se pudo eliminar el acompañante."); return; }
    const quitar = (c: Colaborador): Colaborador =>
      c.id === colaboradorId
        ? { ...c, acompanantes: (c.acompanantes ?? []).filter((a) => a.id !== acompananteId) }
        : c;
    setData((d) => d.map(quitar));
    setDetalle((prev) => (prev ? quitar(prev) : prev));
    toastExito("Acompañante eliminado");
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-8 w-8 text-brand-600" />
          Cargando panel…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cineprox-transparent.png" alt="CineProx" className="h-7 w-auto" />
            <div className="border-l border-slate-200 pl-3">
              <div className="text-sm font-semibold text-slate-900">Panel administrativo</div>
              <div className="text-xs text-slate-500">Día de la Familia</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportarExcel(data)}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Exportar Excel
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Kpi label="Colaboradores" value={stats.totalColaboradores} />
          <Kpi label="Acompañantes" value={stats.totalAcompanantes} />
          <Kpi label="Total asistentes" value={stats.totalAsistentes} accent />
          <Kpi label="Menores de 14" value={stats.totalMenores} />
          <Kpi label="Antigüedad prom." value={`${stats.promedioAntiguedad} m`} />
        </section>

        {/* Gráficas */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card title="Menores por rango de edad">
            {stats.totalMenores === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.rangos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="rango" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                    {stats.rangos.map((_, i) => (
                      <Cell key={i} fill={COLORS_BAR[i % COLORS_BAR.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title="Género de menores de 14 años">
            {stats.totalMenores === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.genero}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {stats.genero.map((_, i) => (
                      <Cell key={i} fill={COLORS_GENERO[i % COLORS_GENERO.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </section>

        {/* Tabla */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">Colaboradores inscritos</h2>
            <input
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre o cédula…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-72"
            />
          </div>

          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <Th label="Empleado" k="nombre_completo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <Th label="Cédula" k="cedula" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 font-semibold">Sede</th>
                  <th className="px-4 py-3 font-semibold">Fecha ingreso</th>
                  <Th label="Antigüedad" k="antiguedad_meses" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <Th label="Acompañantes" k="acompanantes" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <Th label="Inscripción" k="created_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 font-semibold text-right">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      No hay inscripciones que mostrar.
                    </td>
                  </tr>
                )}
                {pageRows.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.nombre_completo}</td>
                    <td className="px-4 py-3 text-slate-600">{c.cedula}</td>
                    <td className="px-4 py-3 text-slate-600">{c.sede ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{nombreMes(c.ingreso_mes)} {c.ingreso_anio}</td>
                    <td className="px-4 py-3 text-slate-600">{c.antiguedad_meses} meses</td>
                    <td className="px-4 py-3 text-slate-600">{c.acompanantes?.length ?? 0}</td>
                    <td className="px-4 py-3 text-slate-600">{formatearFecha(c.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetalle(c)}
                        className="rounded-md bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-500">
              {filtrados.length} registro{filtrados.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-slate-500">{pageSafe} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal detalle */}
      {detalle && (
        <DetalleModal
          c={detalle}
          onClose={() => setDetalle(null)}
          onDeleteColaborador={eliminarColaborador}
          onDeleteAcompanante={eliminarAcompanante}
        />
      )}
    </main>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${accent ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ? "text-brand-700" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-[260px] place-items-center text-sm text-slate-400">
      Aún no hay datos de menores.
    </div>
  );
}

function Th({
  label, k, sortKey, sortDir, onSort,
}: {
  label: string; k: SortKey; sortKey: SortKey; sortDir: "asc" | "desc"; onSort: (k: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <th className="px-4 py-3 font-semibold">
      <button onClick={() => onSort(k)} className="inline-flex items-center gap-1 hover:text-slate-800">
        {label}
        <span className="text-[10px]">{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

function DetalleModal({
  c, onClose, onDeleteColaborador, onDeleteAcompanante,
}: {
  c: Colaborador;
  onClose: () => void;
  onDeleteColaborador: (id: string) => void;
  onDeleteAcompanante: (colaboradorId: string, acompananteId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{c.nombre_completo}</h3>
            <p className="text-sm text-slate-500">Cédula {c.cedula}</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
          <Info label="Sede" value={c.sede ?? "—"} />
          <Info label="Estado civil" value={labelEstadoCivil(c.estado_civil)} />
          <Info label="Fecha de ingreso" value={`${nombreMes(c.ingreso_mes)} ${c.ingreso_anio}`} />
          <Info label="Antigüedad" value={`${c.antiguedad_meses} meses`} />
          <Info label="Asistencia" value={c.asistencia === "solo" ? "Solo" : "Acompañado"} />
          <Info label="Inscripción" value={formatearFecha(c.created_at)} />
        </dl>

        <h4 className="mb-2 mt-5 text-sm font-semibold text-slate-700">
          Acompañantes ({c.acompanantes?.length ?? 0})
        </h4>
        {(!c.acompanantes || c.acompanantes.length === 0) ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Este colaborador asiste solo.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 font-semibold">Parentesco</th>
                <th className="py-2 font-semibold">Edad</th>
                <th className="py-2 font-semibold">Género</th>
                <th className="py-2 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {c.acompanantes.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-2 text-slate-800">{a.categoria ?? "—"}</td>
                  <td className="py-2 text-slate-600">{a.edad}</td>
                  <td className="py-2 text-slate-600">
                    {a.genero ? (a.genero === "masculino" ? "Masculino" : "Femenino") : "—"}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onDeleteAcompanante(c.id, a.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4">
          <button
            onClick={() => onDeleteColaborador(c.id)}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Eliminar colaborador
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Elimina el registro completo junto con todos sus acompañantes.
          </p>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
