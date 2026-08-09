import { PenTool, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { SiteRole } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SiteRoleBadgeProps {
  role?: SiteRole;
  compact?: boolean;
  className?: string;
}

const roleDetails = {
  administrator: {
    label: 'Администратор',
    shortLabel: 'Админ',
    Icon: ShieldCheck,
    className: 'border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  contributor: {
    label: 'Сътрудник',
    shortLabel: 'Сътрудник',
    Icon: PenTool,
    className: 'border-sky-400/60 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
} as const;

export default function SiteRoleBadge({ role, compact = false, className }: SiteRoleBadgeProps) {
  if (!role) return null;
  const details = roleDetails[role];
  const Icon = details.Icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 whitespace-nowrap px-1.5 py-0 text-[10px] font-extrabold uppercase tracking-wide',
        details.className,
        className,
      )}
      title={details.label}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {compact ? details.shortLabel : details.label}
    </Badge>
  );
}
