import AdminSurface from '@/components/admin/AdminSurface';

export default function AdminStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <AdminSurface className="space-y-3 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/55">
        {label}
      </p>
      <p className="text-3xl font-semibold tracking-tight text-[#23151b]">
        {value}
      </p>
      <p className="text-sm text-[#6f5d64]">{helper}</p>
    </AdminSurface>
  );
}
