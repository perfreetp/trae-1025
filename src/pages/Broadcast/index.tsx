import { useState } from 'react';
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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import type { BroadcastCategory, BroadcastStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Broadcast() {
  const { broadcastTemplates, broadcastRecords, addBroadcastRecord, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'records' | 'scheduled'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<BroadcastCategory | 'all'>('all');
  const [customContent, setCustomContent] = useState('');
  const [selectedArea, setSelectedArea] = useState<string[]>(['全站']);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

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

  const areas = ['全站', 'A候车区', 'B候车区', 'C候车区', 'D候车区', 'A1检票口', 'A2检票口', 'B1检票口', '进站口', '出站口'];

  const filteredTemplates = selectedCategory === 'all'
    ? broadcastTemplates
    : broadcastTemplates.filter((t) => t.category === selectedCategory);

  const handlePlayTemplate = (templateId: string) => {
    const template = broadcastTemplates.find((t) => t.id === templateId);
    if (template) {
      addBroadcastRecord({
        templateId: template.id,
        content: template.content,
        area: selectedArea,
        operator: currentUser?.name || '系统',
        status: 'playing',
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
                  placeholder="搜索广播内容..."
                  className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            {broadcastRecords.map((record) => (
              <div key={record.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {record.status === 'playing' ? (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                        <Volume2 className="w-4 h-4 text-orange-600" />
                      </div>
                    ) : record.status === 'completed' ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{record.content}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {record.operator}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(record.playTime, 'HH:mm:ss')}
                        </span>
                        <span>区域: {record.area.join('、')}</span>
                      </div>
                    </div>
                  </div>
                  <Tag variant={statusConfig[record.status].variant}>
                    {statusConfig[record.status].label}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'scheduled' && (
        <Card title="定时广播任务">
          <div className="text-center py-12 text-gray-500">
            <Timer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无定时广播任务</p>
            <button className="mt-4 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加定时任务
            </button>
          </div>
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
    </div>
  );
}
