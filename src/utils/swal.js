import Swal from 'sweetalert2';

// Base config — auto-detects dark mode from <html class="dark">
const isDark = () => document.documentElement.classList.contains('dark');

const base = () => ({
  background: isDark() ? '#1e293b' : '#ffffff',
  color: isDark() ? '#f1f5f9' : '#1e293b',
  confirmButtonColor: '#2563eb',
  cancelButtonColor: isDark() ? '#334155' : '#e2e8f0',
  customClass: {
    popup: 'rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700',
    confirmButton: 'rounded-lg px-5 py-2.5 text-sm font-medium',
    cancelButton: 'rounded-lg px-5 py-2.5 text-sm font-medium !text-slate-700 dark:!text-slate-200',
  },
});

// Confirm dialog (replaces window.confirm)
export const confirmDialog = ({ title, text, confirmText = 'Yes, proceed', icon = 'warning' }) =>
  Swal.fire({
    ...base(),
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });

// Delete confirm — red button
export const confirmDelete = ({ title = 'Are you sure?', text = 'This action cannot be undone.' }) =>
  Swal.fire({
    ...base(),
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    confirmButtonColor: '#ef4444',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });

// Success toast
export const successAlert = (title, text) =>
  Swal.fire({
    ...base(),
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
  });

// Error alert
export const errorAlert = (title, text) =>
  Swal.fire({
    ...base(),
    title,
    text,
    icon: 'error',
  });

// Info alert
export const infoAlert = (title, text) =>
  Swal.fire({
    ...base(),
    title,
    text,
    icon: 'info',
  });
