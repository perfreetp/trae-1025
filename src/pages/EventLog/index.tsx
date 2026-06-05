import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  AlertCircle,
  Wrench,
  Users,
  Shield,
  MoreHorizontal,
  X,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import type { EventType, EventSeverity, EventStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function EventLog() {
  const { events, addEvent, updateEventProgress, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'resolved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState({ progress: 0, content: '' });
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'other' as EventType,
    severity: 'low' as EventSeverity,
    location: '',
    description: '',
  });

  const typeConfig: Record<EventType, { label: string; icon: any; color: string }> = {
    congestion: { label: '客流拥堵', icon: Users, color: 'text-orange-600 bg-orange-100' },
    equipment: { label: '设备故障', icon: Wrench, color: 'text-blue-600 bg-blue-100' },
    passenger: { label: '旅客事件', icon: User, color: 'text-purple-600 bg-purple-100' },
    security: { label: '安保事件', icon: Shield, color: 'text-red-600 bg-red-100' },
    other: { label: '其他事件', icon: MoreHorizontal, color: 'text-gray-600 bg-gray-100' },
  };

  const severityConfig: Record<EventSeverity, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
    low: { label: '一般', variant: 'success' },
    medium: { label: '较重', variant: 'warning' },
    high: { label: '严重', variant: 'danger' },
    critical: { label: '紧急', variant: 'danger' },
  };

  const statusConfig: Record<EventStatus, { label: string; variant: 'default' | 'warning' | 'success' }> = {
    pending: { label: '待处理', variant: 'default' },
    processing: { label: '处理中', variant: 'warning' },
    resolved: { label: '已解决', variant: 'success' },
    closed: { label: '已关闭', variant: 'success' },
  };

  const filteredEvents = activeTab === 'all'
    ? events
    : events.filter((e) => e.status === activeTab);

  const stats = {
    all: events.length,
    pending: events.filter((e) => e.status === 'pending').length,
    processing: events.filter((e) => e.status === 'processing').length,
    resolved: events.filter((e) => e.status === 'resolved' || e.status === 'closed').length,
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.location) {
      addEvent({
        ...newEvent,
        reporter: currentUser?.name || '系统',
      });
      setShowAddModal(false);
      setNewEvent({
        title: '',
        type: 'other',
        severity: 'low',
        location: '',
        description: '',
      });
    }
  };

  const handleUpdateProgress = () => {
    if (selectedEvent && progressUpdate.content) {
      const newStatus: EventStatus = progressUpdate.progress >= 100
        ? 'resolved'
        : progressUpdate.progress > 0
          ? 'processing'
          : 'pending';
      updateEventProgress(
        selectedEvent,
        progressUpdate.progress,
        newStatus,
        progressUpdate.content,
        currentUser?.name || '系统'
      );
      setShowProgressModal(false);
      setProgressUpdate({ progress: 0, content: '' });
      setSelectedEvent(null);
    }
  };

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">全部事件</p>
            <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">待处理</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">处理中</p>
            <p className="text-2xl font-bold text-orange-600">{stats.processing}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已解决</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-b border-gray-200 -mb-px">
          {(['all', 'pending', 'processing', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab === 'all' ? '全部' : statusConfig[tab as EventStatus]?.label || tab}
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {stats[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索事件..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-56"
            />
          </div>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            上报事件
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const typeConf = typeConfig[event.type];
            const TypeIcon = typeConf.icon;
            return (
              <Card
                key={event.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedEvent === event.id ? 'ring-2 ring-primary-400' : '',
                  event.severity === 'critical' && 'border-l-4 border-l-red-500'
                )}
                onClick={() => setSelectedEvent(event.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeConf.color)}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.reporter}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(event.reportTime, 'HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Tag variant={severityConfig[event.severity].variant} size="sm">
                          {severityConfig[event.severity].label}
                        </Tag>
                        <Tag variant={statusConfig[event.status].variant} size="sm">
                          {statusConfig[event.status].label}
                        </Tag>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">处置进度</span>
                        <span className="text-xs font-medium text-gray-700">{event.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            event.progress >= 100 ? 'bg-green-500' : 'bg-primary-500'
                          )}
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card title="事件详情">
          {selectedEventData ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const typeConf = typeConfig[selectedEventData.type];
                    const TypeIcon = typeConf.icon;
                    return (
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeConf.color)}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                    );
                  })()}
                  <h3 className="text-lg font-semibold">{selectedEventData.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedEventData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    上报人: {selectedEventData.reporter}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(selectedEventData.reportTime, 'MM-dd HH:mm')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag variant={severityConfig[selectedEventData.severity].variant}>
                  {severityConfig[selectedEventData.severity].label}
                </Tag>
                <Tag variant={statusConfig[selectedEventData.status].variant}>
                  {statusConfig[selectedEventData.status].label}
                </Tag>
                {selectedEventData.handler && (
                  <span className="text-sm text-gray-500">
                    处理人: <span className="font-medium text-gray-700">{selectedEventData.handler}</span>
                  </span>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{selectedEventData.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">处置进度</span>
                  <span className="text-sm font-bold text-primary-600">{selectedEventData.progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      selectedEventData.progress >= 100 ? 'bg-green-500' : 'bg-primary-500'
                    )}
                    style={{ width: `${selectedEventData.progress}%` }}
                  />
                </div>

                {selectedEventData.status !== 'resolved' && selectedEventData.status !== 'closed' && (
                  <button
                    onClick={() => {
                      setProgressUpdate({ progress: selectedEventData.progress, content: '' });
                      setShowProgressModal(true);
                    }}
                    className="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    更新处置进度
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  处置记录
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {selectedEventData.updates.length > 0 ? (
                    selectedEventData.updates.map((update, index) => (
                      <div key={update.id} className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-l-0">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary-500" />
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium text-gray-700">{update.operator}</span>
                          <span className="mx-2">·</span>
                          {format(update.timestamp, 'MM-dd HH:mm')}
                        </div>
                        <p className="text-sm text-gray-700">{update.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">暂无处置记录</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>请选择一个事件查看详情</p>
            </div>
          )}
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">上报事件</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">事件标题</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="请简要描述事件"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">事件类型</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {(Object.keys(typeConfig) as EventType[]).map((type) => (
                      <option key={type} value={type}>{typeConfig[type].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">严重程度</label>
                  <select
                    value={newEvent.severity}
                    onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value as EventSeverity })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {(Object.keys(severityConfig) as EventSeverity[]).map((sev) => (
                      <option key={sev} value={sev}>{severityConfig[sev].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">发生地点</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="如A2检票口、B候车区等"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={3}
                  placeholder="请详细描述事件情况..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                确认上报
              </button>
            </div>
          </div>
        </div>
      )}

      {showProgressModal && selectedEventData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">更新处置进度</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  处置进度: <span className="text-primary-600 font-bold">{progressUpdate.progress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressUpdate.progress}
                  onChange={(e) => setProgressUpdate({ ...progressUpdate, progress: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">处置说明</label>
                <textarea
                  value={progressUpdate.content}
                  onChange={(e) => setProgressUpdate({ ...progressUpdate, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={3}
                  placeholder="请描述当前处置进展..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProgressModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateProgress}
                disabled={!progressUpdate.content}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认更新
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
