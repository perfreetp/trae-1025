import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerExtra?: ReactNode;
  onClick?: () => void;
}

export function Card({ title, children, className, headerExtra, onClick }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}
      onClick={onClick}
    >
      {(title || headerExtra) && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {headerExtra}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
