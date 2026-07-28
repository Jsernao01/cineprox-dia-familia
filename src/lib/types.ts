export type Genero = "masculino" | "femenino";
export type Asistencia = "solo" | "acompanado";

export interface AcompananteInput {
  nombre_completo: string;
  edad: number;
  genero?: Genero | null;
}

export interface InscripcionInput {
  nombre_completo: string;
  cedula: string;
  ingreso_mes: number;
  ingreso_anio: number;
  asistencia: Asistencia;
  acompanantes: AcompananteInput[];
}

export interface Acompanante extends AcompananteInput {
  id: string;
  colaborador_id: string;
}

export interface Colaborador {
  id: string;
  nombre_completo: string;
  cedula: string;
  ingreso_mes: number;
  ingreso_anio: number;
  antiguedad_meses: number;
  asistencia: Asistencia;
  created_at: string;
  acompanantes: Acompanante[];
}
