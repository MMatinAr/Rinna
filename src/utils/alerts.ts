import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const base = {
  direction: "rtl" as const,
  buttonsStyling: false,
  heightAuto: false,
  customClass: {
    popup: "rinna-swal-popup",
    title: "rinna-swal-title",
    htmlContainer: "rinna-swal-content",
    confirmButton: "rinna-swal-confirm",
    cancelButton: "rinna-swal-cancel",
    denyButton: "rinna-swal-deny",
    actions: "rinna-swal-actions",
    icon: "rinna-swal-icon",
    timerProgressBar: "rinna-swal-progress"
  }
};

export const rinnaToast = Swal.mixin({
  ...base,
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  showCloseButton: true
});

export function notifySuccess(title: string, text?: string) {
  return rinnaToast.fire({ icon: "success", title, text });
}
export function notifyError(title: string, text?: string) {
  return rinnaToast.fire({ icon: "error", title, text, timer: 4200 });
}
export function notifyInfo(title: string, text?: string) {
  return rinnaToast.fire({ icon: "info", title, text });
}
export function notifyMessage(message: string) {
  const looksLikeError = /وارد کن|الزامی|تکراری|معتبر نیست|نامعتبر|پیدا نشد|در دسترس نیست|خطا|ناموفق|باید /.test(message);
  return (looksLikeError ? notifyError : notifySuccess)(message);
}

export async function confirmAction(options: {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}) {
  const result = await Swal.fire({
    ...base,
    icon: options.danger ? "warning" : "question",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmText || "بله، ادامه بده",
    cancelButtonText: options.cancelText || "انصراف",
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false
  });
  return result.isConfirmed;
}
