import Link from "next/link";
import { getInscripcionesAbiertas } from "@/lib/config";
import FormularioInscripcion from "./FormularioInscripcion";

export const dynamic = "force-dynamic";

export default async function InscripcionPage() {
  const abiertas = await getInscripcionesAbiertas();

  if (!abiertas) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-3xl text-amber-600">
            ⏳
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Inscripciones cerradas</h1>
          <p className="mt-2 text-sm text-slate-600">
            El registro para el Día de la Familia CineProx ha finalizado. Si crees que es un error,
            comunícate con Gestión Humana.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return <FormularioInscripcion />;
}
