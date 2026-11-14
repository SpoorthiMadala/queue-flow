import { Mail, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { initials, fmtDateTime } from '../utils/format.js';

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <div className="card mx-auto max-w-xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">{initials(user.name)}</div>
        <div className="min-w-0"><h2 className="truncate text-xl font-semibold">{user.name}</h2><p className="text-sm text-slate-500">Queue manager</p></div>
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><dd className="break-all">{user.email}</dd></div>
        <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-slate-400" /><dd>Joined {fmtDateTime(user.createdAt)}</dd></div>
      </dl>
      <button onClick={logout} className="btn-secondary mt-6"><LogOut className="h-4 w-4" />Log out</button>
    </div>
  );
}
