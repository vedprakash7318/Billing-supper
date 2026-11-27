// Zero SweetAlert & Zero Toast - completely silent & lightweight
export const showToast = () => {};
export const toastSuccess = () => {};
export const toastError = (message) => {
  if (message) {
    console.warn('[App Error]:', message);
  }
};
export const toastInfo = () => {};
export const toastWarning = () => {};

export const confirmDialog = ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
}) => {
  const message = title ? `${title}\n${text}` : text;
  return Promise.resolve(window.confirm(message));
};

export default {
  toastSuccess,
  toastError,
  toastInfo,
  toastWarning,
  confirmDialog,
};
