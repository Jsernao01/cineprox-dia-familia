import Link from "next/link";

const INSTRUCCIONES = [
  "Complete toda la información solicitada.",
  "Verifique que los datos sean correctos.",
  "El número de acompañantes depende de su estado civil.",
  "Una vez enviado el formulario no podrá modificar la información.",
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Base: degradado violeta de marca (rellena los lados con color, no negro) */}
      <div
        className="fixed inset-0 -z-20"
        style={{ background: "radial-gradient(circle at 50% 32%, #4a1088 0%, #2a0850 42%, #140427 100%)" }}
        aria-hidden
      />
      {/* La imagen difuminada encima, mezclada con el violeta */}
      <div
        className="fixed inset-0 -z-10 scale-125 bg-cover bg-center opacity-70 blur-2xl"
        style={{ backgroundImage: "url('/fondo.jpg')" }}
        aria-hidden
      />

      {/* Barra superior */}
      <header className="flex justify-end px-6 py-4">
        <Link
          href="/admin/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Administrador
        </Link>
      </header>

      {/* Póster completo + instrucciones + botón */}
      <section className="mx-auto flex w-full max-w-md flex-col items-center px-4 pb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/fondo.jpg"
          alt="Día de la Familia CineProx"
          className="w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
        />

        <div className="mt-6 w-full rounded-2xl border border-white/15 bg-slate-950/60 p-6 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-white/90">
            Instrucciones
          </h2>
          <ul className="space-y-2.5">
            {INSTRUCCIONES.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-white/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/inscripcion"
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Comenzar inscripción
        </Link>
      </section>
    </main>
  );
}
