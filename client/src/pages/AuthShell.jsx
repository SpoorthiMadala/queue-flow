import { Layers } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="rounded-lg bg-brand-600 p-2 text-white"><Layers className="h-6 w-6" /></div>
          <span className="text-2xl font-semibold tracking-tight">QueueFlow</span>
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </div>
  );
}
