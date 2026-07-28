import Link from "next/link";

const INSTRUCCIONES = [
  "Complete toda la información solicitada.",
  "Verifique que los datos sean correctos.",
  "Puede registrar hasta siete acompañantes.",
  "Una vez enviado el formulario no podrá modificar la información.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-brand-50">
      {/* Barra superior */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cineprox-transparent.png" alt="CineProx" className="h-8 w-auto" />
        <Link
          href="/admin/login"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-brand-100 hover:text-brand-700"
        >
          Administrador
        </Link>
      </header>

      {/* Contenido */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-8 text-center sm:pt-12">
        {/* Logo destacado */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cineprox-transparent.png"
          alt="CineProx"
          className="mb-8 h-16 w-auto sm:h-20"
        />

        <span className="mb-4 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          Día de la Familia
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Bienvenida Familia <span className="text-brand-600">CineProx</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
          Este formulario corresponde al registro para el Día de la Familia CineProx. La
          siguiente información será utilizada para organizar la participación de nuestros
          colaboradores y sus familias.
        </p>

        <div className="mt-10 w-full max-w-xl rounded-2xl border border-brand-100 bg-white p-6 text-left shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">
            Instrucciones
          </h2>
          <ul className="space-y-2">
            {INSTRUCCIONES.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/inscripcion"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Comenzar inscripción
        </Link>
      </section>


    </main>
  );
}
