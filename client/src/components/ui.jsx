import { useEffect } from 'react';
import { Loader2, X, AlertTriangle, Inbox } from 'lucide-react';

export const Spinner = ({ className = 'h-5 w-5' }) => <Loader2 className={`animate-spin ${className}`} />;

export const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-brand-600"><Spinner className="h-7 w-7" /></div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="card flex flex-col items-center gap-3 p-8 text-center">
    <AlertTriangle className="h-8 w-8 text-rose-500" />
    <p className="text-sm text-slate-600">{message}</p>
    {onRetry && <button className="btn-secondary" onClick={onRetry}>Try again</button>}
  </div>
);

export const EmptyState = ({ icon: Icon = Inbox, title, text, action }) => (
  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
    <div className="rounded-full bg-slate-100 p-3"><Icon className="h-6 w-6 text-slate-400" /></div>
    <p className="font-medium text-slate-700">{title}</p>
    {text && <p className="max-w-xs text-sm text-slate-500">{text}</p>}
    {action}
  </div>
);

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmText = 'Confirm', busy, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose} disabled={busy}>Keep it</button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>{busy && <Spinner className="h-4 w-4" />}{confirmText}</button>
      </div>
    </Modal>
  );
}

export const StatCard = ({ icon: Icon, label, value, tone = 'indigo' }) => {
  const tones = { indigo: 'bg-indigo-50 text-indigo-600', amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600', sky: 'bg-sky-50 text-sky-600' };
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`rounded-lg p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const m = { Waiting: 'bg-amber-50 text-amber-700', Serving: 'bg-sky-50 text-sky-700', Served: 'bg-emerald-50 text-emerald-700', Cancelled: 'bg-rose-50 text-rose-700' };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m[status]}`}>{status}</span>;
};
