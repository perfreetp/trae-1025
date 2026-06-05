import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  Sofa,
  Volume2,
  Users,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '客流总览' },
  { path: '/gate-monitor', icon: ScanLine, label: '闸机监测' },
  { path: '/waiting-area', icon: Sofa, label: '候车区管理' },
  { path: '/broadcast', icon: Volume2, label: '广播通知' },
  { path: '/staff-scheduling', icon: Users, label: '人员排班' },
  { path: '/event-log', icon: FileText, label: '事件记录' },
  { path: '/analysis', icon: BarChart3, label: '复盘分析' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'bg-primary-500 text-white flex flex-col transition-all duration-300 h-screen sticky top-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-primary-600">
        {!sidebarCollapsed ? (
          <h1 className="text-lg font-bold">车站客流组织</h1>
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">车</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-white/10',
                    isActive ? 'bg-white/20 font-medium' : '',
                    sidebarCollapsed ? 'justify-center' : ''
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center border-t border-primary-600 hover:bg-white/10 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
