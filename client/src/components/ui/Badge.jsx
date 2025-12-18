const colorClasses = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  cyan: 'badge-cyan',
  purple: 'badge-purple',
  default: 'bg-surface-700 text-surface-300',
};

export default function Badge({ children, color = 'default', className = '' }) {
  return (
    <span className={`badge ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
}
