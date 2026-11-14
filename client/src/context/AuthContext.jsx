import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('qf_token'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('qf_token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Restore session on refresh
  useEffect(() => {
    if (!localStorage.getItem('qf_token')) return;
    authApi.me().then((d) => setUser(d.user)).catch(() => localStorage.removeItem('qf_token')).finally(() => setLoading(false));
  }, []);

  // Session expired mid-use
  useEffect(() => {
    const h = () => { setUser(null); navigate('/login', { state: { expired: true } }); };
    window.addEventListener('qf:session-expired', h);
    return () => window.removeEventListener('qf:session-expired', h);
  }, [navigate]);

  const finish = ({ user, token }) => { localStorage.setItem('qf_token', token); setUser(user); };
  const login = async (body) => finish(await authApi.login(body));
  const register = async (body) => finish(await authApi.register(body));

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}
