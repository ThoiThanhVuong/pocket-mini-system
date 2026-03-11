import { useAuthStore } from '@/store/useAuthStore';

/**
 * Hook to check user permissions
 * Backend returns permissions as strings like 'product.create', 'user.view'
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  /**
   * Check if user has a specific permission
   * @param permission - Permission code as string (e.g., 'product.create')
   */
  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  /**
   * Check if user has ANY of the specified permissions
   * @param permissions - Array of permission codes
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some((p) => user.permissions!.includes(p));
  };

  /**
   * Check if user has ALL of the specified permissions
   * @param permissions - Array of permission codes
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.every((p) => user.permissions!.includes(p));
  };

  /**
   * Check if user has a specific role
   * @param role - Role code as string
   */
  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  /**
   * Check if user has ANY of the specified roles
   * @param roles - Array of role codes
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.roles) return false;
    return roles.some((r) => user.roles!.includes(r));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    // Expose user permissions for debugging/display
    permissions: user?.permissions || [],
    roles: user?.roles || [],
  };
}
