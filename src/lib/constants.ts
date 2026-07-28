export const SEDES = [
  "Administrativo (Operaciones, Call Center, Mantenimiento, Oficina)",
  "Aventura",
  "Aves María",
  "Carnaval",
  "Florida",
  "Guacarí",
  "La Central",
  "Las Américas",
  "Mayorca",
  "Monterrey",
  "Parque Fabricato",
  "Plaza del Río",
  "Puerta del Norte",
  "San Nicolás",
  "Viva la Ceja",
] as const;

export type EstadoCivil = "soltero_con_hijos" | "soltero_sin_hijos" | "otro";

export const ESTADOS_CIVILES: { value: EstadoCivil; label: string }[] = [
  { value: "soltero_con_hijos", label: "Soltero con hijos" },
  { value: "soltero_sin_hijos", label: "Soltero sin hijos" },
  { value: "otro", label: "Otro" },
];

export function labelEstadoCivil(v?: string | null): string {
  return ESTADOS_CIVILES.find((e) => e.value === v)?.label ?? "—";
}

// Parentescos disponibles cuando el estado civil es "Otro"
export const PARENTESCOS = [
  "Cónyuge",
  "Padre",
  "Madre",
  "Hijo(a)",
  "Hermano(a)",
  "Abuelo(a)",
  "Nieto(a)",
  "Tío(a)",
  "Sobrino(a)",
  "Primo(a)",
  "Suegro(a)",
  "Yerno",
  "Nuera",
  "Cuñado(a)",
] as const;
