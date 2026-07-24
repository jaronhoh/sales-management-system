import { Badge } from '@/components/ui/badge';

const statusStyles: Record<string, string> = {
  Pending: 'bg-warning/15 text-warning border-warning/30',
  Confirmed: 'bg-info/15 text-info border-info/30',
  Delivered: 'bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400',
  GRN: 'bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400',
  Paid: 'bg-success/15 text-success border-success/30',
  Cancelled: 'bg-muted text-muted-foreground border-border line-through',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={statusStyles[status] || ''}>
      {status}
    </Badge>
  );
}
