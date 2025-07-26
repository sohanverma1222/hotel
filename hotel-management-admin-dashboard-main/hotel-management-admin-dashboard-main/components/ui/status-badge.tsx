import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  available: 'room-available',
  occupied: 'room-occupied',
  maintenance: 'room-maintenance',
  cleaning: 'room-cleaning',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'status-badge',
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}

export default StatusBadge;