/**
 * Antigüedad en meses desde (mes/año de ingreso) hasta hoy.
 * Ej: ingreso marzo 2023, hoy agosto 2026 => 41 meses.
 */
export function calcularAntiguedadMeses(
  ingresoMes: number,
  ingresoAnio: number,
  hoy: Date = new Date()
): number {
  const meses =
    (hoy.getFullYear() - ingresoAnio) * 12 +
    (hoy.getMonth() + 1 - ingresoMes);
  return Math.max(0, meses);
}

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function nombreMes(m: number): string {
  return MESES[m - 1] ?? "";
}

export function formatearFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
  } catch {
    return iso;
  }
}
