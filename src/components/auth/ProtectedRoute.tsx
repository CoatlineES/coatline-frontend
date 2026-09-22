import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  allowedPermissions?: string[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, allowedPermissions, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere cambiar la clave y no está ya en la ruta de cambio de clave
  if (user.requirePasswordChange && location.pathname !== '/app/cambiar-clave') {
    return <Navigate to="/app/cambiar-clave" replace />;
  }

  const roleName = typeof user.role === 'object' && user.role !== null ? (user.role as any).name : user.role;
  const normalizedRole = typeof roleName === 'string' ? roleName.toUpperCase() : roleName;
  const userPermissions = user.customPermissions || [];

  const hasRequiredRole = Boolean(allowedRoles && normalizedRole && allowedRoles.includes(normalizedRole as any));
  const hasRequiredPerm = Boolean(allowedPermissions && userPermissions.some(p => allowedPermissions.includes(p)));

  // If restrictions are defined, user must have either the role OR the permission
  const hasRestrictions = Boolean(allowedRoles?.length || allowedPermissions?.length);
  const hasAccess = !hasRestrictions || hasRequiredRole || hasRequiredPerm;

  if (!hasAccess) {
    // Si el rol no está permitido, lo enviamos a su home base
    const isClient = normalizedRole === 'CLIENT' || normalizedRole === 'CLIENTE';
    const redirectPath = isClient ? '/app/cliente' : '/app/empleado';
    
    if (location.pathname === redirectPath || location.pathname === redirectPath + '/') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 p-6">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
            <p className="text-sm text-slate-500">
              No tienes los permisos necesarios para acceder a esta vista. Rol actual: <span className="font-bold text-slate-700">{roleName || 'Ninguno'}</span>
            </p>
          </div>
        </div>
      );
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
