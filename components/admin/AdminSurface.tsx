import { cn } from '@/lib/utils/cn';

export default function AdminSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        '',
        className,
      )}
    >
      {children}
    </section>
  );
}
