import Swal from 'sweetalert2';

// Modern Top-Right Toast Notifications
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0f172a',
  color: '#ffffff',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-800 text-xs px-4 py-3',
  },
});

export const showToast = (message, icon = 'success') => {
  Toast.fire({
    icon,
    title: message,
  });
};

export const toastSuccess = (message) => showToast(message, 'success');
export const toastError = (message) => showToast(message, 'error');
export const toastInfo = (message) => showToast(message, 'info');
export const toastWarning = (message) => showToast(message, 'warning');

// Modern Tailwind-Styled Confirm Dialog
export const confirmDialog = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel',
  icon = 'warning',
  isDangerous = false,
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl border border-slate-200/80 font-sans',
      title: 'text-xl font-black text-slate-900 tracking-tight mb-2',
      htmlContainer: 'text-xs text-slate-500 font-medium leading-relaxed',
      actions: 'flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 w-full',
      confirmButton: isDangerous
        ? 'px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer'
        : 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer',
      cancelButton:
        'px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer',
    },
  });

  return result.isConfirmed;
};

// Full Alert Modal
export const alertModal = ({
  title,
  text,
  icon = 'info',
  confirmButtonText = 'OK',
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-3xl p-6 sm:p-8 max-w-md shadow-2xl border border-slate-200 font-sans',
      title: 'text-xl font-black text-slate-900 tracking-tight mb-2',
      htmlContainer: 'text-xs text-slate-500 font-medium leading-relaxed',
      confirmButton:
        'px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer',
    },
  });
};

export default {
  toastSuccess,
  toastError,
  toastInfo,
  toastWarning,
  confirmDialog,
  alertModal,
};
