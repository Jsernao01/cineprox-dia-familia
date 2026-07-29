import Link from "next/link";

const INSTRUCCIONES = [
  "Complete toda la información solicitada.",
  "Verifique que los datos sean correctos.",
  "El número de acompañantes depende de su estado civil.",
  "Una vez enviado el formulario no podrá modificar la información.",
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#faf6ef] to-[#f0e9dd]">
      {/* Barra superior */}
      <header className="flex justify-end px-6 py-4">
        <Link
          href="/admin/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-800"
        >
          Administrador
        </Link>
      </header>

      {/* Póster + instrucciones + botón */}
      <section className="mx-auto flex w-full max-w-md flex-col items-center px-4 pb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/fondo.jpg"
          alt="Día de la Familia CineProx"
          className="w-full rounded-2xl shadow-2xl ring-1 ring-black/5"
        />

        <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand-700">
            Instrucciones
          </h2>
          <ul className="space-y-2.5">
            {INSTRUCCIONES.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/inscripcion"
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Comenzar inscripción
        </Link>
      </section>
    </main>
  );
}
