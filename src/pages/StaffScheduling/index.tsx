import { useState } from 'react';
import {
  Users,
  Clock,
  MapPin,
  UserCheck,
  UserX,
  Coffee,
  Calendar,
  Search,
  Filter,
  Plus,
  Phone,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import { mockSchedules, mockPatrolRecords } from '@/mock';
import type { ShiftType, StaffStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function StaffScheduling() {
  const { staff } = useAppStore();
  const [activeTab, setActiveTab] = useState<'status' | 'schedule' | 'patrol'>('status');
  const [selectedShift, setSelectedShift] = useState<ShiftType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusConfig: Record<StaffStatus, { label: string; variant: 'success' | 'default' | 'warning'; icon: any; color: string }> = {
    on_duty: { label: '在岗', variant: 'success', icon: UserCheck, color: 'text-green-600 bg-green-100' },
    off_duty: { label: '离岗', variant: 'default', icon: UserX, color: 'text-gray-500 bg-gray-100' },
    rest: { label: '休息', variant: 'warning', icon: Coffee, color: 'text-yellow-600 bg-yellow-100' },
  };

  const shiftConfig: Record<ShiftType, { label: string; time: string; color: string }> = {
    morning: { label: '早班', time: '06:00-14:00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    afternoon: { label: '中班', time: '14:00-22:00', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    night: { label: '夜班', time: '22:00-06:00', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  };

  const posts = ['站长室', 'A候车区', 'B候车区', 'C候车区', 'D候车区', 'A1检票口', 'A2检票口', 'B1检票口', 'B2检票口', 'C1检票口', '进站口', '出站口', '服务台'];

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = s.name.includes(searchQuery) || s.position.includes(searchQuery);
    const matchesShift = selectedShift === 'all' ||
      mockSchedules.some((sch) => sch.staffId === s.id && sch.shift === selectedShift);
    return matchesSearch && matchesShift;
  });

  const onDutyCount = staff.filter((s) => s.status === 'on_duty').length;
  const offDutyCount = staff.filter((s) => s.status === 'off_duty').length;
  const restCount = staff.filter((s) => s.status === 'rest').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">工作人员总数</p>
            <p className="text-2xl font-bold text-gray-900">{staff.length}<span className="text-sm font-normal text-gray-500">人</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">在岗人数</p>
            <p className="text-2xl font-bold text-green-600">{onDutyCount}<span className="text-sm font-normal text-gray-500">人</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <UserX className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">离岗人数</p>
            <p className="text-2xl font-bold text-gray-600">{offDutyCount}<span className="text-sm font-normal text-gray-500">人</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Coffee className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">休息人数</p>
            <p className="text-2xl font-bold text-yellow-600">{restCount}<span className="text-sm font-normal text-gray-500">人</span></p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { key: 'status', label: '人员状态', icon: Users },
          { key: 'schedule', label: '排班管理', icon: Calendar },
          { key: 'patrol', label: '巡查记录', icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              'px-4 py-3 flex items-center gap-2 border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'status' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索人员姓名或岗位..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedShift('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedShift === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  全部班次
                </button>
                {(Object.keys(shiftConfig) as ShiftType[]).map((shift) => (
                  <button
                    key={shift}
                    onClick={() => setSelectedShift(shift)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      selectedShift === shift
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {shiftConfig[shift].label}
                  </button>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Plus className="w-4 h-4" />
              添加人员
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredStaff.map((s) => {
              const status = statusConfig[s.status];
              const StatusIcon = status.icon;
              const schedule = mockSchedules.find((sch) => sch.staffId === s.id);
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">{s.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{s.name}</h4>
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', status.color)}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{s.position}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {s.currentPost && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-primary-500" />
                            <span>{s.currentPost}</span>
                          </div>
                        )}
                        {schedule && (
                          <Tag variant="info" size="sm">
                            {shiftConfig[schedule.shift].label}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <Card title="岗位分配">
              <div className="space-y-4">
                {posts.map((post) => {
                  const postStaff = mockSchedules.filter((s) => s.post === post).map((s) => staff.find((st) => st.id === s.staffId)).filter(Boolean);
                  return (
                    <div key={post} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          <span className="font-medium text-gray-900">{post}</span>
                        </div>
                        <span className="text-sm text-gray-500">{postStaff.length}人在岗</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {postStaff.map((s) => s && (
                          <div key={s.id} className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-medium">
                              {s.name.charAt(0)}
                            </span>
                            <span>{s.name}</span>
                            {s.status === 'on_duty' ? (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-gray-300" />
                            )}
                          </div>
                        ))}
                        <button className="px-3 py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          分配人员
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {(['morning', 'afternoon', 'night'] as ShiftType[]).map((shift) => {
              const config = shiftConfig[shift];
              const shiftSchedules = mockSchedules.filter((s) => s.shift === shift);
              return (
                <Card key={shift} className={cn('border-2', config.color)}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{config.label}</h4>
                      <p className="text-xs opacity-75">{config.time}</p>
                    </div>
                    <Tag variant="info" size="sm">{shiftSchedules.length}人</Tag>
                  </div>
                  <div className="space-y-2">
                    {shiftSchedules.map((sch) => {
                      const s = staff.find((st) => st.id === sch.staffId);
                      return s ? (
                        <div key={sch.id} className="flex items-center justify-between text-sm py-1">
                          <span>{s.name}</span>
                          <span className="text-gray-500">{sch.post}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'patrol' && (
        <div className="grid grid-cols-3 gap-6">
          <Card title="今日巡查打卡" className="col-span-2">
            <div className="space-y-3">
              {mockPatrolRecords.map((record, index) => {
                const s = staff.find((st) => st.id === record.staffId);
                return (
                  <div key={record.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{record.checkpoint}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(record.timestamp, 'HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">巡查人员: {s?.name || '未知'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="巡查点位">
            <div className="space-y-3">
              {['A候车区-1号点位', 'A候车区-2号点位', 'A候车区-3号点位', 'B候车区-1号点位', 'B候车区-2号点位', '进站口', '出站口', '换乘通道'].map((point, index) => {
                const isChecked = mockPatrolRecords.some((r) => r.checkpoint === point);
                return (
                  <div key={point} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center',
                      isChecked ? 'bg-green-100' : 'bg-gray-100'
                    )}>
                      {isChecked ? (
                        <UserCheck className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <span className="text-gray-400 text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className={cn('text-sm', isChecked ? 'text-gray-900' : 'text-gray-500')}>
                      {point}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
