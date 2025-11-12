import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function RequireAuth({ children }) {
  const { user, initializing } = useUser();
  const loc = useLocation();
  if (initializing) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;
  return children;
}
