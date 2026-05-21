import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAccess } from '../../hooks/useAdminAccess';

export const AdminProtectedRoute = ({ children }) => {
  const { isStaff, isLoading } = useAdminAccess();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;