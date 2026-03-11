import { PartnerStatus } from '@/types/partners/customer';

// Re-export so pages only need one import for both the enum and helpers
export { PartnerStatus };


export const PARTNER_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [PartnerStatus.ACTIVE]: {
    label: 'Hoạt động',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  [PartnerStatus.INACTIVE]: {
    label: 'Không hoạt động',
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
  [PartnerStatus.BLOCKED]: {
    label: 'Bị chặn',
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function getPartnerStatusLabel(status: string): string {
  return PARTNER_STATUS_CONFIG[status]?.label ?? status;
}

export function getPartnerStatusClass(status: string): string {
  return (
    PARTNER_STATUS_CONFIG[status]?.className ??
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  );
}
