import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// UI convenience only: the API enforces roles independently.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-slate-500">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
