import { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, BarChart3, User, LogOut, Menu, X, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/format.js';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/queues', label: 'Queue Management', icon: ListOrdered },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="rounded-lg bg-brand-600 p-1.5 text-white"><Layers className="h-5 w-5" /></div>
      <span className="text-lg font-semibold tracking-tight">QueueFlow</span>
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="py-5"><Logo /></div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon className="h-4 w-4" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{initials(user.name)}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="h-4 w-4" />Log out
        </button>
      </div>
    </div>
  );
}

const titles = { '/': 'Overview', '/queues': 'Queue Management', '/analytics': 'Analytics', '/profile': 'Profile' };

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = titles[pathname] || 'QueueFlow';

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block"><SidebarContent /></aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="truncate text-xs text-slate-500">
            <Link to="/" className="hover:text-brand-600">QueueFlow</Link> / <span className="text-slate-700">{title}</span>
          </nav>
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
        </div>
        <Link to="/profile" className="flex items-center gap-2" aria-label="Profile">
          <span className="hidden text-sm text-slate-600 sm:block">{user.name}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{initials(user.name)}</span>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6"><Outlet /></main>
    </div>
  );
}
