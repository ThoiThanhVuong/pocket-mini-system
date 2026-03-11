"use client";

import React from 'react';
import { Can } from '@/components/common/Can';

interface ActionGuardProps {
  permission: string;
  children: React.ReactElement;
  tooltip?: string;
}

export function ActionGuard({
  permission,
  children,
  tooltip = 'Bạn không có quyền thực hiện thao tác này',
}: ActionGuardProps) {
  return (
    <Can
      permission={permission}
      fallback={
        <span
          title={tooltip}
          className="inline-flex"
          style={{ opacity: 0.35, cursor: 'not-allowed', pointerEvents: 'all' }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ pointerEvents: 'none' }}>{children}</span>
        </span>
      }
    >
      {children}
    </Can>
  );
}
