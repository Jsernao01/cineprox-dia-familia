import * as XLSX from "xlsx";
import type { Colaborador } from "./types";
import { nombreMes } from "./utils";
import { labelEstadoCivil } from "./constants";

export function exportarExcel(colaboradores: Colaborador[]) {
  const rows: Record<string, string | number>[] = [];

  for (const c of colaboradores) {
    const base = {
      Empleado: c.nombre_completo,
      Cédula: c.cedula,
      Sede: c.sede ?? "",
      "Estado civil": labelEstadoCivil(c.estado_civil),
      "Fecha ingreso": `${nombreMes(c.ingreso_mes)} ${c.ingreso_anio}`,
      "Antigüedad (meses)": c.antiguedad_meses,
      Asistencia: c.asistencia === "solo" ? "Solo" : "Acompañado",
    };

    if (!c.acompanantes || c.acompanantes.length === 0) {
      rows.push({ ...base, Parentesco: "", Edad: "", Género: "" });
    } else {
      for (const a of c.acompanantes) {
        rows.push({
          ...base,
          Parentesco: a.categoria ?? "",
          Edad: a.edad,
          Género: a.genero ? (a.genero === "masculino" ? "Masculino" : "Femenino") : "",
        });
      }
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Empleado", "Cédula", "Sede", "Estado civil", "Fecha ingreso",
      "Antigüedad (meses)", "Asistencia", "Parentesco", "Edad", "Género",
    ],
  });
  ws["!cols"] = [
    { wch: 28 }, { wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 16 },
    { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 8 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `CineProx_DiaFamilia_${fecha}.xlsx`);
}
