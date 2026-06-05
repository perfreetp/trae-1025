import { useState, useMemo } from 'react';
import {
  Volume2,
  Play,
  Clock,
  Plus,
  Search,
  Filter,
  Timer,
  Megaphone,
  AlertTriangle,
  Info,
  User,
  X,
  CheckCircle,
  XCircle,
  CalendarDays,
  Repeat,
  Trash2,
  PlayCircle,
  XOctagon,
  RotateCcw,
  Edit,
  Calendar,
  Zap,
  Radio,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import type { BroadcastCategory, BroadcastStatus, ScheduledBroadcastStatus, BroadcastSource, ScheduledBroadcast } from '@/types';
import { cn } from '@/lib/utils';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Broadcast() {
  const {
    broadcastTemplates,
    broadcastRecords,
    scheduledBroadcasts,
    addBroadcastRecord,
    addScheduledBroadcast,
    updateScheduledBroadcast,
    cancelScheduledBroadcast,
    currentUser,
    broadcastFilter,
    setBroadcastFilter,
    clearBroadcastFilter,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'records' | 'scheduled'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<BroadcastCategory | 'all'>('all');
  const [customContent, setCustomContent] = useState('');
  const [selectedArea, setSelectedArea] = useState<string[]>(['全站']);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [showAddScheduledModal, setShowAddScheduledModal] = useState(false);
  const [showEditScheduledModal, setShowEditScheduledModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingScheduled, setEditingScheduled] = useState<ScheduledBroadcast | null>(null);
  const [newScheduled, setNewScheduled] = useState({
    name: '',
    content: '',
    templateId: '',
    area: ['全站'],
    scheduledTime: '',
    repeat: 'once' as 'once' | 'daily' | 'weekly',
  });

  const sourceConfig: Record<BroadcastSource, { label: string; icon: any; color: string }> = {
    template: { label: '模板广播', icon: Play, color: 'text-blue-600 bg-blue-100' },
    custom: { label: '自定义', icon: Megaphone, color: 'text-green-600 bg-green-100' },
    scheduled: { label: '定时广播', icon: Timer, color: 'text-purple-600 bg-purple-100' },
  };

  const categoryConfig = {
    checkin: { label: '检票广播', icon: Megaphone, color: 'text-blue-600 bg-blue-100' },
    delay: { label: '晚点通知', icon: Clock, color: 'text-orange-600 bg-orange-100' },
    notice: { label: '普通公告', icon: Info, color: 'text-green-600 bg-green-100' },
    paging: { label: '寻人广播', icon: User, color: 'text-purple-600 bg-purple-100' },
    emergency: { label: '紧急广播', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
  };

  const statusConfig: Record<BroadcastStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
    playing: { label: '播放中', variant: 'warning' },
    completed: { label: '已完成', variant: 'success' },
    failed: { label: '播放失败', variant: 'danger' },
  };

  const scheduledStatusConfig: Record<ScheduledBroadcastStatus, { label: string; variant: 'warning' | 'success' | 'default' }> = {
    pending: { label: '待播放', variant: 'warning' },
    played: { label: '已播放', variant: 'success' },
    cancelled: { label: '已取消', variant: 'default' },
  };

  const areas = ['全站', 'A候车区', 'B候车区', 'C候车区', 'D候车区', 'A1检票口', 'A2检票口', 'B1检票口', '进站口', '出站口'];

  const filteredTemplates = selectedCategory === 'all'
    ? broadcastTemplates
    : broadcastTemplates.filter((t) => t.category === selectedCategory);

  const filteredRecords = useMemo(() => {
    return broadcastRecords.filter((record) => {
      const searchLower = broadcastFilter.search.toLowerCase();
      const matchesSearch = !searchLower ||
        record.content.toLowerCase().includes(searchLower) ||
        record.operator.toLowerCase().includes(searchLower) ||
        record.area.some((a) => a.toLowerCase().includes(searchLower));

      const matchesStatus = broadcastFilter.status === 'all' || record.status === broadcastFilter.status;
      const matchesArea = broadcastFilter.area === 'all' || record.area.includes(broadcastFilter.area);

      let matchesDate = true;
      if (broadcastFilter.startDate && broadcastFilter.endDate) {
        const start = startOfDay(new Date(broadcastFilter.startDate));
        const end = endOfDay(new Date(broadcastFilter.endDate));
        matchesDate = isWithinInterval(new Date(record.playTime), { start, end });
      } else if (broadcastFilter.startDate) {
        const start = startOfDay(new Date(broadcastFilter.startDate));
        matchesDate = new Date(record.playTime) >= start;
      } else if (broadcastFilter.endDate) {
        const end = endOfDay(new Date(broadcastFilter.endDate));
        matchesDate = new Date(record.playTime) <= end;
      }

      return matchesSearch && matchesStatus && matchesArea && matchesDate;
    });
  }, [broadcastRecords, broadcastFilter]);

  const handlePlayTemplate = (templateId: string) => {
    const template = broadcastTemplates.find((t) => t.id === templateId);
    if (template) {
      addBroadcastRecord({
        templateId: template.id,
        content: template.content,
        area: selectedArea,
        operator: currentUser?.name || '系统',
        status: 'playing',
        source: 'template',
      });
    }
  };

  const handlePlayCustom = () => {
    if (customContent.trim()) {
      addBroadcastRecord({
        content: customContent,
        area: selectedArea,
        operator: currentUser?.name || '系统',
        status: 'playing',
        source: 'custom',
      });
      setCustomContent('');
    }
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  const toggleArea = (area: string) => {
    if (selectedArea.includes(area)) {
      setSelectedArea(selectedArea.filter((a) => a !== area));
    } else {
      setSelectedArea([...selectedArea, area]);
    }
  };

  const toggleScheduledArea = (area: string) => {
    if (newScheduled.area.includes(area)) {
      setNewScheduled({ ...newScheduled, area: newScheduled.area.filter((a) => a !== area) });
    } else {
      setNewScheduled({ ...newScheduled, area: [...newScheduled.area, area] });
    }
  };

  const toggleEditScheduledArea = (area: string) => {
    if (!editingScheduled) return;
    if (editingScheduled.area.includes(area)) {
      setEditingScheduled({ ...editingScheduled, area: editingScheduled.area.filter((a) => a !== area) });
    } else {
      setEditingScheduled({ ...editingScheduled, area: [...editingScheduled.area, area] });
    }
  };

  const handleAddScheduled = () => {
    const content = newScheduled.templateId
      ? broadcastTemplates.find((t) => t.id === newScheduled.templateId)?.content || ''
      : newScheduled.content;

    if (newScheduled.name && content && newScheduled.scheduledTime) {
      addScheduledBroadcast({
        name: newScheduled.name,
        content,
        templateId: newScheduled.templateId || undefined,
        area: newScheduled.area,
        scheduledTime: new Date(newScheduled.scheduledTime),
        repeat: newScheduled.repeat,
        createdBy: currentUser?.name || '系统',
      });
      setShowAddScheduledModal(false);
      setNewScheduled({
        name: '',
        content: '',
        templateId: '',
        area: ['全站'],
        scheduledTime: '',
        repeat: 'once',
      });
    }
  };

  const handleEditScheduled = (sb: ScheduledBroadcast) => {
    setEditingScheduled(sb);
    setShowEditScheduledModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingScheduled) return;
    const content = editingScheduled.templateId
      ? broadcastTemplates.find((t) => t.id === editingScheduled.templateId)?.content || ''
      : editingScheduled.content;

    updateScheduledBroadcast(editingScheduled.id, {
      name: editingScheduled.name,
      content,
      templateId: editingScheduled.templateId || undefined,
      area: editingScheduled.area,
      scheduledTime: new Date(editingScheduled.scheduledTime),
      repeat: editingScheduled.repeat,
    });
    setShowEditScheduledModal(false);
    setEditingScheduled(null);
  };

  const hasActiveFilter = broadcastFilter.search || broadcastFilter.status !== 'all' || broadcastFilter.area !== 'all' || broadcastFilter.startDate || broadcastFilter.endDate;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { key: 'templates', label: '广播模板', icon: Volume2 },
          { key: 'custom', label: '自定义广播', icon: Plus },
          { key: 'records', label: '播放记录', icon: Clock },
          { key: 'scheduled', label: '定时广播', icon: Timer },
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
            {tab.key === 'scheduled' && scheduledBroadcasts.filter((s) => s.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 bg-accent-orange text-white text-xs rounded-full">
                {scheduledBroadcasts.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {(Object.keys(categoryConfig) as BroadcastCategory[]).map((cat) => {
                const config = categoryConfig[cat];
                const CatIcon = config.icon;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                      selectedCategory === cat
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                播放区域:
                <span className="ml-2 font-medium text-gray-700">{selectedArea.join('、')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const catConfig = categoryConfig[template.category];
              const CatIcon = catConfig.icon;
              return (
                <Card
                  key={template.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedTemplate === template.id ? 'ring-2 ring-primary-400' : ''
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', catConfig.color)}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <Tag variant={template.category === 'emergency' ? 'danger' : 'info'} size="sm">
                          {catConfig.label}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template.content);
                      }}
                      className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-4 h-4" />
                      预览
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTemplate(template.id);
                      }}
                      className="flex-1 py-2 px-3 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4" />
                      立即播放
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'custom' && (
        <div className="grid grid-cols-3 gap-6">
          <Card title="广播内容" className="col-span-2">
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="请输入广播内容..."
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                字数: {customContent.length} / 500
              </span>
              <button
                onClick={handlePlayCustom}
                disabled={!customContent.trim()}
                className="py-2.5 px-6 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Megaphone className="w-4 h-4" />
                立即广播
              </button>
            </div>
          </Card>

          <Card title="选择播放区域">
            <div className="space-y-2">
              {areas.map((area) => (
                <label
                  key={area}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    selectedArea.includes(area)
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedArea.includes(area)}
                    onChange={() => toggleArea(area)}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'records' && (
        <Card
          title="广播记录"
          headerExtra={
            <div className="flex items-center gap-2">
              <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={broadcastFilter.search}
                  onChange={(e) => setBroadcastFilter({ search: e.target.value })}
                  placeholder="搜索内容、操作人、区域..."
                  className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-56"
                />
              </div>
              <button
                onClick={() => setShowFilterModal(true)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm transition-colors',
                  hasActiveFilter
                    ? 'border-primary-400 bg-primary-50 text-primary-600'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                )}
              >
                <Filter className="w-4 h-4" />
                筛选
                {hasActiveFilter && <span className="w-1.5 h-1.5 bg-accent-orange rounded-full" />}
              </button>
              {hasActiveFilter && (
                <button
                  onClick={clearBroadcastFilter}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置
                </button>
              )}
            </div>
          }
        >
          {filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map((record) => {
                const sourceInfo = sourceConfig[record.source || 'custom'];
                const SourceIcon = sourceInfo.icon;
                return (
                  <div key={record.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        {record.status === 'playing' ? (
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center animate-pulse flex-shrink-0">
                            <Volume2 className="w-4 h-4 text-orange-600" />
                          </div>
                        ) : record.status === 'completed' ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', sourceInfo.color)}>
                              <SourceIcon className="w-3 h-3" />
                              {sourceInfo.label}
                            </span>
                            {record.source === 'scheduled' && record.scheduledTaskName && (
                              <span className="text-xs text-gray-500">
                                任务: {record.scheduledTaskName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{record.content}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {record.operator}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(record.playTime, 'yyyy-MM-dd HH:mm:ss')}
                            </span>
                            {record.source === 'scheduled' && record.scheduledTime && (
                              <span className="flex items-center gap-1 text-purple-600">
                                <Calendar className="w-3 h-3" />
                                计划: {format(new Date(record.scheduledTime), 'HH:mm')}
                              </span>
                            )}
                            <span>区域: {record.area.join('、')}</span>
                          </div>
                        </div>
                      </div>
                      <Tag variant={statusConfig[record.status].variant} className="flex-shrink-0">
                        {statusConfig[record.status].label}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>没有找到匹配的播放记录</p>
          </div>
        )}
      </Card>
    )}

      {activeTab === 'scheduled' && (
        <Card
          title="定时广播任务"
          headerExtra={
            <button
              onClick={() => setShowAddScheduledModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加定时任务
            </button>
          }
        >
          {scheduledBroadcasts.length > 0 ? (
            <div className="space-y-3">
              {scheduledBroadcasts.map((sb) => (
              <div
                key={sb.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  sb.status === 'cancelled' ? 'bg-gray-50 border-gray-200 opacity-70' :
                  sb.status === 'played' ? 'bg-green-50 border-green-200' :
                  'bg-white border-gray-200 hover:border-primary-300'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      sb.status === 'pending' ? 'bg-orange-100' :
                      sb.status === 'played' ? 'bg-green-100' :
                      'bg-gray-100'
                    )}>
                      {sb.status === 'pending' ? (
                        <Timer className="w-5 h-5 text-orange-600" />
                      ) : sb.status === 'played' ? (
                        <PlayCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XOctagon className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className={cn(
                        'font-semibold',
                        sb.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {sb.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{sb.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {format(sb.scheduledTime, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5" />
                          {sb.repeat === 'once' ? '仅一次' :
                           sb.repeat === 'daily' ? '每天' : '每周'}
                        </span>
                        <span>区域: {sb.area.join('、')}</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {sb.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag variant={scheduledStatusConfig[sb.status].variant} size="sm">
                      {scheduledStatusConfig[sb.status].label}
                    </Tag>
                    {sb.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEditScheduled(sb)}
                          className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                          title="编辑任务"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cancelScheduledBroadcast(sb.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="取消任务"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无定时广播任务</p>
            <button
              onClick={() => setShowAddScheduledModal(true)}
              className="mt-4 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加定时任务
            </button>
          </div>
        )}
      </Card>
    )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary-500" />
                广播内容预览
              </h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-gray-700 leading-relaxed">{previewContent}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddScheduledModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary-500" />
                添加定时广播
              </h3>
              <button onClick={() => setShowAddScheduledModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                <input
                  type="text"
                  value={newScheduled.name}
                  onChange={(e) => setNewScheduled({ ...newScheduled, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="如：早间安全提示广播"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择广播模板</label>
                <select
                  value={newScheduled.templateId}
                  onChange={(e) => setNewScheduled({ ...newScheduled, templateId: e.target.value, content: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">自定义内容</option>
                  {broadcastTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {!newScheduled.templateId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广播内容</label>
                  <textarea
                    value={newScheduled.content}
                    onChange={(e) => setNewScheduled({ ...newScheduled, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                    placeholder="请输入广播内容..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">播放时间</label>
                  <input
                    type="datetime-local"
                    value={newScheduled.scheduledTime}
                    onChange={(e) => setNewScheduled({ ...newScheduled, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">重复方式</label>
                  <select
                    value={newScheduled.repeat}
                    onChange={(e) => setNewScheduled({ ...newScheduled, repeat: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="once">仅一次</option>
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">播放区域</label>
                <div className="grid grid-cols-2 gap-2">
                  {areas.map((area) => (
                    <label
                      key={area}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm',
                        newScheduled.area.includes(area)
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={newScheduled.area.includes(area)}
                        onChange={() => toggleScheduledArea(area)}
                        className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddScheduledModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddScheduled}
                disabled={!newScheduled.name || (!newScheduled.templateId && !newScheduled.content) || !newScheduled.scheduledTime}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-500" />
                筛选播放记录
              </h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">播放状态</label>
                <select
                  value={broadcastFilter.status}
                  onChange={(e) => setBroadcastFilter({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部状态</option>
                  <option value="playing">播放中</option>
                  <option value="completed">已完成</option>
                  <option value="failed">播放失败</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">播放区域</label>
                <select
                  value={broadcastFilter.area}
                  onChange={(e) => setBroadcastFilter({ area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部区域</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">开始日期</label>
                    <input
                      type="date"
                      value={broadcastFilter.startDate}
                      onChange={(e) => setBroadcastFilter({ startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">结束日期</label>
                    <input
                      type="date"
                      value={broadcastFilter.endDate}
                      onChange={(e) => setBroadcastFilter({ endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={clearBroadcastFilter}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置筛选
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                应用筛选
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditScheduledModal && editingScheduled && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary-500" />
                编辑定时广播
              </h3>
              <button onClick={() => { setShowEditScheduledModal(false); setEditingScheduled(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                <input
                  type="text"
                  value={editingScheduled.name}
                  onChange={(e) => setEditingScheduled({ ...editingScheduled, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="如：早间安全提示广播"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择广播模板</label>
                <select
                  value={editingScheduled.templateId || ''}
                  onChange={(e) => setEditingScheduled({ 
                    ...editingScheduled, 
                    templateId: e.target.value || undefined,
                    content: e.target.value ? '' : editingScheduled.content
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">自定义内容</option>
                  {broadcastTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {!editingScheduled.templateId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">广播内容</label>
                  <textarea
                    value={editingScheduled.content}
                    onChange={(e) => setEditingScheduled({ ...editingScheduled, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                    placeholder="请输入广播内容..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">播放时间</label>
                  <input
                    type="datetime-local"
                    value={format(new Date(editingScheduled.scheduledTime), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setEditingScheduled({ ...editingScheduled, scheduledTime: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">重复方式</label>
                  <select
                    value={editingScheduled.repeat}
                    onChange={(e) => setEditingScheduled({ ...editingScheduled, repeat: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="once">仅一次</option>
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">播放区域</label>
                <div className="grid grid-cols-2 gap-2">
                  {areas.map((area) => (
                    <label
                      key={area}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm',
                        editingScheduled.area.includes(area)
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={editingScheduled.area.includes(area)}
                        onChange={() => toggleEditScheduledArea(area)}
                        className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditScheduledModal(false); setEditingScheduled(null); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editingScheduled.name || (!editingScheduled.templateId && !editingScheduled.content)}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
