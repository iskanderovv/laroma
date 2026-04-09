'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#422933]">{label}</span>
        <input
          ref={ref}
          className={cn(
            'w-full rounded-2xl border bg-[#fffafb] px-4 py-3 text-sm text-[#1f1418] outline-none transition placeholder:text-[#a68e97]',
            error
              ? 'border-[#d14d72] ring-4 ring-[#fbe7ee]'
              : 'border-[#eadde1] focus:border-primary/35 focus:ring-4 focus:ring-primary/10',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-sm text-[#be335e]">{error}</span> : null}
      </label>
    );
  },
);

AdminInput.displayName = 'AdminInput';

export default AdminInput;
