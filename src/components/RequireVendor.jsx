import { Navigate, useLocation } from 'react-router-dom';
import { useVendor } from '../context/VendorContext';

export default function RequireVendor({ children }) {
  const { isAuthenticated, loading } = useVendor();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor" state={{ from: location }} replace />;
  }

  return children;
}