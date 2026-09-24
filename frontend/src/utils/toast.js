export function toast(text) {
  const d = document.createElement('div'); d.textContent = text; d.setAttribute('role', 'status');
  d.className = 'fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white';
  document.body.append(d); setTimeout(() => d.remove(), 2600);
}
