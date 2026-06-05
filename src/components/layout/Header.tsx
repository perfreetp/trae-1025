import { Bell, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function Header() {
  const { currentUser, events } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const pendingEvents = events.filter((e) => e.status === 'pending' || e.status === 'processing').length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg">
            {format(currentTime, 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {pendingEvents > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-orange text-white text-xs rounded-full flex items-center justify-center">
              {pendingEvents}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
            <div className="text-xs text-gray-500">{currentUser?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
