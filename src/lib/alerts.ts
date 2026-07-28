import Swal from "sweetalert2";

const BRAND = "#901CEB";
const GRIS = "#64748b";
const ROJO = "#dc2626";

export function alertaAdvertencia(text: string) {
  return Swal.fire({
    icon: "warning",
    title: "Revisa el formulario",
    text,
    confirmButtonColor: BRAND,
    confirmButtonText: "Entendido",
  });
}

export function alertaError(text: string) {
  return Swal.fire({
    icon: "error",
    title: "Ups…",
    text,
    confirmButtonColor: BRAND,
    confirmButtonText: "Cerrar",
  });
}

export function alertaExito(text: string) {
  return Swal.fire({
    icon: "success",
    title: "¡Listo!",
    text,
    confirmButtonColor: BRAND,
    confirmButtonText: "Aceptar",
  });
}

// Diálogo de confirmación (para borrados). Devuelve true si el usuario confirma.
export async function confirmarEliminar(title: string, text: string): Promise<boolean> {
  const res = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: ROJO,
    cancelButtonColor: GRIS,
    reverseButtons: true,
    focusCancel: true,
  });
  return res.isConfirmed;
}

// Notificación pequeña tipo toast (esquina superior).
export function toastExito(title: string) {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}
