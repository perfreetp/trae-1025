import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple';
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'blue', className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-sm font-medium',
                trend.isUp ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400">较昨日</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
