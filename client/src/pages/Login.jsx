import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import { Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const er = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Enter a valid email address';
    if (!form.password) er.password = 'Enter your password';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try { await login(form); toast.success('Welcome back'); } catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };

  return (
    <AuthShell title="Log in" subtitle="Manage your queues and serve people faster."
      footer={<>New to QueueFlow? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create an account</Link></>}>
      {state?.expired && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Your session expired. Log in again to continue.</p>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Log in</button>
      </form>
    </AuthShell>
  );
}
