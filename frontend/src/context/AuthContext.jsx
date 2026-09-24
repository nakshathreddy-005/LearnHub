import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => setUser((await api.post('/auth/login', { email, password })).data.user);
  const register = async (f) => setUser((await api.post('/auth/register', f)).data.user);
  const logout = async () => { await api.post('/auth/logout'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
