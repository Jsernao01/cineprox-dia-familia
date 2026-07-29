import type { Colaborador } from "./types";
import { EDAD_MENOR } from "./constants";

export function calcularStats(cols: Colaborador[]) {
  const totalColaboradores = cols.length;
  const acompanantes = cols.flatMap((c) => c.acompanantes ?? []);
  const totalAcompanantes = acompanantes.length;
  const totalAsistentes = totalColaboradores + totalAcompanantes;

  const menores = acompanantes.filter((a) => a.edad <= EDAD_MENOR);
  const totalMenores = menores.length;

  const promedioAntiguedad =
    totalColaboradores === 0
      ? 0
      : Math.round(
          cols.reduce((s, c) => s + c.antiguedad_meses, 0) / totalColaboradores
        );

  // Rangos de edad de menores (0 a 12 años)
  const rangos = [
    { rango: "0 - 4", cantidad: menores.filter((a) => a.edad >= 0 && a.edad <= 4).length },
    { rango: "5 - 8", cantidad: menores.filter((a) => a.edad >= 5 && a.edad <= 8).length },
    { rango: "9 - 12", cantidad: menores.filter((a) => a.edad >= 9 && a.edad <= 12).length },
  ];

  // Género de menores
  const genero = [
    { name: "Masculino", value: menores.filter((a) => a.genero === "masculino").length },
    { name: "Femenino", value: menores.filter((a) => a.genero === "femenino").length },
  ];

  return {
    totalColaboradores,
    totalAcompanantes,
    totalAsistentes,
    totalMenores,
    promedioAntiguedad,
    rangos,
    genero,
  };
}
