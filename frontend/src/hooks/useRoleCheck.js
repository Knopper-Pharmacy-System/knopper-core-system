import { useAuth } from './useAuth.js';

export const useRoleCheck = () => {
  const { userRole } = useAuth();

  const hasRole = (requiredRoles) => {
    if (!userRole) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    return userRole === requiredRoles;
  };

  const isAdmin = () => userRole === 'admin';
  const isManager = () => userRole === 'manager';
  const isStaff = () => userRole === 'staff';

  const canAccess = (feature) => {
    const rolePermissions = {
      // Admin can access everything
      admin: ['dashboard', 'users', 'inventory', 'procurement', 'reports', 'pos', 'admin'],

      // Manager permissions
      manager: ['dashboard', 'inventory', 'procurement', 'reports', 'pos'],

      // Staff permissions
      staff: ['dashboard', 'inventory', 'pos']
    };

    if (!userRole || !rolePermissions[userRole]) return false;
    return rolePermissions[userRole].includes(feature);
  };

  return {
    userRole,
    hasRole,
    isAdmin,
    isManager,
    isStaff,
    canAccess
  };
};