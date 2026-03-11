import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface CanProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions to check */
  permissions?: string[];
  /** Require ALL permissions (default: false = require ANY) */
  requireAll?: boolean;
  /** Fallback element to show when permission denied */
  fallback?: React.ReactNode;
  /** Children to render when permission granted */
  children: React.ReactNode;
}

/**
 * Conditionally render content based on user permissions
 * 
 * @example
 * ```tsx
 * <Can permission="product.create">
 *   <button>Add Product</button>
 * </Can>
 * 
 * <Can permissions={["product.view", "product.update"]}>
 *   <ProductDetails />
 * </Can>
 * 
 * <Can permissions={["order.create", "payment.create"]} requireAll>
 *   <CheckoutButton />
 * </Can>
 * ```
 */
export function Can({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let allowed = false;

  if (permissions && permissions.length > 0) {
    allowed = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (permission) {
    allowed = hasPermission(permission);
  }

  return <>{allowed ? children : fallback}</>;
}
