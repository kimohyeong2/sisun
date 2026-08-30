export function Badge({ children, variant }: { children: React.ReactNode, variant: 'active' | 'inactive' | 'primary' }) {
  const styles = {
    active: 'bg-[#e7f3ef] text-[#1aae39]',
    inactive: 'bg-[#f1f1ef] text-[#615d59]',
    primary: 'bg-[#ebf5fe] text-[#0075de]'
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${styles[variant]}`}>{children}</span>;
}
