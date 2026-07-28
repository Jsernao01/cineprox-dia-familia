import type { Colaborador } from "./types";

export function calcularStats(cols: Colaborador[]) {
  const totalColaboradores = cols.length;
  const acompanantes = cols.flatMap((c) => c.acompanantes ?? []);
  const totalAcompanantes = acompanantes.length;
  const totalAsistentes = totalColaboradores + totalAcompanantes;

  const menores = acompanantes.filter((a) => a.edad <= 14);
  const totalMenores = menores.length;

  const promedioAntiguedad =
    totalColaboradores === 0
      ? 0
      : Math.round(
          cols.reduce((s, c) => s + c.antiguedad_meses, 0) / totalColaboradores
        );

  // Rangos de edad de menores
  const rangos = [
    { rango: "0 - 5", cantidad: menores.filter((a) => a.edad >= 0 && a.edad <= 5).length },
    { rango: "6 - 10", cantidad: menores.filter((a) => a.edad >= 6 && a.edad <= 10).length },
    { rango: "11 - 14", cantidad: menores.filter((a) => a.edad >= 11 && a.edad <= 14).length },
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
