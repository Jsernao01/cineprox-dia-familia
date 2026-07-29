import * as XLSX from "xlsx";
import type { Colaborador } from "./types";
import { EDAD_MENOR } from "./constants";

export function exportarExcel(colaboradores: Colaborador[]) {
  const rows = colaboradores.map((c) => {
    const acomp = c.acompanantes ?? [];
    const menores = acomp.filter((a) => a.edad <= EDAD_MENOR).length;
    const mayores = acomp.filter((a) => a.edad > EDAD_MENOR).length;
    const totalAcomp = acomp.length;
    return {
      "Nombre del colaborador": c.nombre_completo,
      CC: c.cedula,
      Sede: c.sede ?? "",
      Asistencia: c.asistencia === "solo" ? "Solo" : "Acompañado",
      [`Acompañantes menores (≤${EDAD_MENOR})`]: menores,
      [`Acompañantes mayores (>${EDAD_MENOR})`]: mayores,
      "Total de acompañantes": totalAcomp,
      "Total de asistentes": totalAcomp + 1, // incluye al colaborador
    };
  });

  const header = [
    "Nombre del colaborador",
    "CC",
    "Sede",
    "Asistencia",
    `Acompañantes menores (≤${EDAD_MENOR})`,
    `Acompañantes mayores (>${EDAD_MENOR})`,
    "Total de acompañantes",
    "Total de asistentes",
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header });
  ws["!cols"] = [
    { wch: 30 }, { wch: 14 }, { wch: 40 }, { wch: 12 },
    { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `CineProx_DiaFamilia_${fecha}.xlsx`);
}
