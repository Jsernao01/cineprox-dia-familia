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

export type EstadoCivil = "soltero_con_hijos" | "soltero_sin_hijos" | "casado_union_libre";

export const ESTADOS_CIVILES: { value: EstadoCivil; label: string }[] = [
  { value: "soltero_con_hijos", label: "Soltero con hijos" },
  { value: "soltero_sin_hijos", label: "Soltero sin hijos" },
  { value: "casado_union_libre", label: "Casado / Unión libre" },
];

export function labelEstadoCivil(v?: string | null): string {
  if (v === "otro") return "Casado / Unión libre"; // compatibilidad con registros anteriores
  return ESTADOS_CIVILES.find((e) => e.value === v)?.label ?? "—";
}

export const PARENTESCOS = [
  "Cónyuge/Compañero(a) sentimental",
  "Hijo(a)",
] as const;
