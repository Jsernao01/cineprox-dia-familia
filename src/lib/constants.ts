export const SEDES = [
  "Carnaval",
  "Guacarí",
  "Plaza del Río",
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

// Edad máxima (inclusive) para considerar a un acompañante como "menor"
export const EDAD_MENOR = 12;

// Parentesco de cónyuge (solo se puede seleccionar una vez por colaborador)
export const PARENTESCO_CONYUGE = "Cónyuge/Compañero(a) permanente";

export const PARENTESCOS = [
  PARENTESCO_CONYUGE,
  "Hijo(a)/Hijastro(a)",
] as const;
