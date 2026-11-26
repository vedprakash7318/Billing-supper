// Custom lightweight, sleek toast and confirm dialog (Zero SweetAlert dependency)

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'app-custom-toast-container';
    toastContainer.style.cssText =
      'position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 99999; display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; max-width: 90vw; width: max-content;';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export const showToast = (message, type = 'success') => {
  if (!message) return;
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.style.cssText =
    'display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 9999px; font-size: 12px; font-weight: 700; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2); backdrop-filter: blur(8px); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; transform: translateY(-10px) scale(0.95); pointer-events: auto;';

  let iconSvg = '';
  if (type === 'success') {
    toast.style.backgroundColor = '#0f172a';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid rgba(16, 185, 129, 0.4)';
    iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
  } else if (type === 'error') {
    toast.style.backgroundColor = '#0f172a';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid rgba(244, 63, 94, 0.4)';
    iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else {
    toast.style.backgroundColor = '#0f172a';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid rgba(99, 102, 241, 0.4)';
    iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 2600);
};

export const toastSuccess = (message) => showToast(message, 'success');
export const toastError = (message) => showToast(message, 'error');
export const toastInfo = (message) => showToast(message, 'info');
export const toastWarning = (message) => showToast(message, 'error');

export const confirmDialog = ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel',
  isDangerous = false,
}) => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position: fixed; inset: 0; z-index: 999999; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0; transition: opacity 0.2s ease;';

    const card = document.createElement('div');
    card.style.cssText =
      'background: #ffffff; border-radius: 24px; padding: 24px; max-width: 360px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(226, 232, 240, 0.8); font-family: inherit; transform: scale(0.95); transition: transform 0.2s ease; text-align: left;';

    card.innerHTML = `
      <div style="margin-bottom: 8px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.02em;">${title}</h3>
        <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; font-weight: 500;">${text}</p>
      </div>
      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 20px; padding-top: 12px; border-top: 1px solid #f1f5f9;">
        <button id="custom-dialog-cancel" style="padding: 8px 16px; border-radius: 12px; background: #f1f5f9; color: #334155; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: background 0.15s;">
          ${cancelButtonText}
        </button>
        <button id="custom-dialog-confirm" style="padding: 8px 18px; border-radius: 12px; background: ${isDangerous ? '#e11d48' : '#4f46e5'}; color: #ffffff; font-size: 12px; font-weight: 700; border: none; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: opacity 0.15s;">
          ${confirmButtonText}
        </button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });

    const cleanup = (result) => {
      overlay.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(result);
      }, 180);
    };

    card.querySelector('#custom-dialog-cancel').addEventListener('click', () => cleanup(false));
    card.querySelector('#custom-dialog-confirm').addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
};

export const alertModal = ({ title, text }) => {
  return confirmDialog({ title, text, cancelButtonText: 'Close', confirmButtonText: 'OK' });
};

export default {
  toastSuccess,
  toastError,
  toastInfo,
  toastWarning,
  confirmDialog,
  alertModal,
};
