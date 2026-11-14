import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, []);
  const api = { success: (m) => push('success', m), error: (m) => push('error', m) };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            {t.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
            <p className="flex-1 text-sm text-slate-700">{t.message}</p>
            <button onClick={() => remove(t.id)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
