import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-8.5 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground shadow-xs/5 outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 sm:h-7.5 sm:text-sm dark:bg-input/32',
        className
      )}
      {...props}
    />
  );
}
