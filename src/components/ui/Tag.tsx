import { cn } from '@/lib/utils';

type TagVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
type TagSize = 'sm' | 'md';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Tag({ children, variant = 'default', size = 'sm', className }: TagProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md font-medium', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}
