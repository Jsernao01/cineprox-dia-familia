"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "No se pudo iniciar sesión."); return; }
      router.push(params.get("redirect") || "/admin/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Usuario</label>
      <input
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className={inputCls}
        autoComplete="username"
      />
      <label className="mb-1.5 mt-4 block text-sm font-medium text-slate-700">Contraseña</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputCls}
        autoComplete="current-password"
      />
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cineprox-transparent.png"
            alt="CineProx"
            className="mx-auto mb-4 h-11 w-auto"
          />
          <h1 className="text-xl font-bold text-slate-900">Panel administrativo</h1>
        </div>

        <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-400 shadow-sm">Cargando…</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
