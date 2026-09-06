import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type ToastOptions = {
  title: string;
  text?: string;
};

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3600,
  timerProgressBar: true,
  customClass: {
    popup: "tungmeow-toast",
  },
  didOpen: (toastElement) => {
    toastElement.addEventListener("mouseenter", Swal.stopTimer);
    toastElement.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const notify = {
  success: ({ title, text }: ToastOptions) => toast.fire({ icon: "success", title, text }),
  error: ({ title, text }: ToastOptions) => toast.fire({ icon: "error", title, text }),
  info: ({ title, text }: ToastOptions) => toast.fire({ icon: "info", title, text }),
};

export async function confirmDeleteTransaction() {
  const result = await Swal.fire({
    title: "Delete this transaction?",
    text: "This action can't be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Keep it",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "tungmeow-dialog",
      confirmButton: "tungmeow-button tungmeow-button-danger",
      cancelButton: "tungmeow-button tungmeow-button-quiet",
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
}

export async function confirmPossibleDuplicateSlip(duplicateOf: { date: string; amount: number; note: string }) {
  const result = await Swal.fire({
    title: "This might already be logged",
    text: `Found a similar transaction on ${duplicateOf.date} for ฿${duplicateOf.amount}. Continue anyway?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Continue anyway",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "tungmeow-dialog",
      confirmButton: "tungmeow-button tungmeow-button-danger",
      cancelButton: "tungmeow-button tungmeow-button-quiet",
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
}

export async function confirmDisconnectSheet() {
  const result = await Swal.fire({
    title: "Disconnect Google Sheet?",
    text: "TungMeow won't be able to read or write until you reconnect.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Disconnect",
    cancelButtonText: "Stay connected",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "tungmeow-dialog",
      confirmButton: "tungmeow-button tungmeow-button-danger",
      cancelButton: "tungmeow-button tungmeow-button-quiet",
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
}
