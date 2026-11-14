import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from './AuthShell.jsx';
import { Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../services/api.js';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const er = {};
    if (!form.name.trim()) er.name = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Enter a valid email address';
    if (form.password.length < 6) er.password = 'Use at least 6 characters';
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try { await register({ name: form.name, email: form.email, password: form.password }); toast.success('Account created'); }
    catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };

  const field = (k, label, type = 'text', ac) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} type={type} autoComplete={ac} className="input" value={form[k]} onChange={set(k)} />
      {errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>}
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle="Set up your first queue in under a minute."
      footer={<>Already registered? <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field('name', 'Full name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', 'new-password')}
        {field('confirm', 'Confirm password', 'password', 'new-password')}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4" />}Create account</button>
      </form>
    </AuthShell>
  );
}
