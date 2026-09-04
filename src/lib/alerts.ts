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

// Confirmación genérica (acción no destructiva). Devuelve true si confirma.
export async function confirmarAccion(
  title: string,
  text: string,
  confirmText: string,
  peligroso = false
): Promise<boolean> {
  const res = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    confirmButtonColor: peligroso ? ROJO : BRAND,
    cancelButtonColor: GRIS,
    reverseButtons: true,
  });
  return res.isConfirmed;
}

// Confirmación reforzada: exige escribir una palabra exacta para continuar.
export async function confirmarConTexto(
  title: string,
  html: string,
  palabra: string
): Promise<boolean> {
  const res = await Swal.fire({
    icon: "warning",
    title,
    html,
    input: "text",
    inputPlaceholder: `Escribe ${palabra}`,
    inputAttributes: { autocapitalize: "off", autocorrect: "off", spellcheck: "false" },
    showCancelButton: true,
    confirmButtonText: "Eliminar todo",
    cancelButtonText: "Cancelar",
    confirmButtonColor: ROJO,
    cancelButtonColor: GRIS,
    reverseButtons: true,
    focusCancel: true,
    preConfirm: (val: string) => {
      if (val !== palabra) {
        Swal.showValidationMessage(`Escribe exactamente "${palabra}" para confirmar.`);
        return false;
      }
      return true;
    },
  });
  // Con preConfirm, Swal solo resuelve como confirmado cuando la palabra es correcta.
  return res.isConfirmed === true;
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
