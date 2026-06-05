import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Sofa,
  Users,
  AlertTriangle,
  Plus,
  MapPin,
  Clock,
  UserPlus,
  Baby,
  Heart,
  Accessibility,
  User,
  X,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import type { SpecialPassengerType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function WaitingArea() {
  const { waitingAreas, specialPassengers, addSpecialPassenger, updateSpecialPassengerStatus } = useAppStore();
  const [selectedArea, setSelectedArea] = useState(waitingAreas[0].id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    type: 'elderly' as SpecialPassengerType,
    contact: '',
    trainNumber: '',
    seatNumber: '',
    notes: '',
  });

  const passengerTypeConfig = {
    elderly: { label: '老人', icon: User, color: 'text-blue-600 bg-blue-100' },
    disabled: { label: '残障', icon: Accessibility, color: 'text-purple-600 bg-purple-100' },
    pregnant: { label: '孕妇', icon: Heart, color: 'text-pink-600 bg-pink-100' },
    child: { label: '儿童', icon: Baby, color: 'text-yellow-600 bg-yellow-100' },
    other: { label: '其他', icon: User, color: 'text-gray-600 bg-gray-100' },
  };

  const statusConfig = {
    waiting: { label: '候车中', variant: 'info' as const },
    boarding: { label: '检票中', variant: 'warning' as const },
    completed: { label: '已上车', variant: 'success' as const },
  };

  const selectedAreaData = waitingAreas.find((a) => a.id === selectedArea) || waitingAreas[0];

  const saturationColor = (saturation: number) => {
    if (saturation >= 80) return 'text-red-600';
    if (saturation >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const saturationProgressColor = (saturation: number) => {
    if (saturation >= 80) return 'bg-red-500';
    if (saturation >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const heatmapOption = {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    },
    grid: {
      height: '70%',
      top: '5%',
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i)),
      splitArea: { show: true },
      axisLabel: { show: false },
    },
    yAxis: {
      type: 'category',
      data: Array.from({ length: 8 }, (_, i) => `${i + 1}`),
      splitArea: { show: true },
      axisLabel: { show: false },
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: {
        color: ['#dcfce7', '#86efac', '#22c55e', '#facc15', '#ef4444'],
      },
    },
    series: [
      {
        name: '客流密度',
        type: 'heatmap',
        data: selectedAreaData.heatmapData,
        label: { show: false },
      },
    ],
  };

  const handleAddPassenger = () => {
    if (newPassenger.name && newPassenger.trainNumber) {
      addSpecialPassenger(newPassenger);
      setShowAddModal(false);
      setNewPassenger({
        name: '',
        type: 'elderly',
        contact: '',
        trainNumber: '',
        seatNumber: '',
        notes: '',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        {waitingAreas.map((area) => (
          <Card
            key={area.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedArea === area.id ? 'ring-2 ring-primary-400' : ''
            )}
            onClick={() => setSelectedArea(area.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{area.name}</h4>
              {area.saturation >= 80 && (
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className={cn('text-3xl font-bold font-mono', saturationColor(area.saturation))}>
                {area.saturation}%
              </span>
              <span className="text-sm text-gray-500">饱和度</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  当前人数
                </span>
                <span className="font-medium">{area.current}/{area.capacity}人</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', saturationProgressColor(area.saturation))}
                  style={{ width: `${area.saturation}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card title={`${selectedAreaData.name} - 区域热力分布`} className="col-span-2">
          <ReactECharts option={heatmapOption} style={{ height: '350px' }} />
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200" />
              <span className="text-sm text-gray-600">稀疏</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-400" />
              <span className="text-sm text-gray-600">正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-400" />
              <span className="text-sm text-gray-600">较密集</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm text-gray-600">密集</span>
            </div>
          </div>
        </Card>

        <Card
          title="重点旅客登记"
          headerExtra={
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              新增登记
            </button>
          }
        >
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {specialPassengers.map((p) => {
              const typeConfig = passengerTypeConfig[p.type];
              const TypeIcon = typeConfig.icon;
              return (
                <div key={p.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', typeConfig.color)}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{typeConfig.label} · {p.trainNumber}</p>
                      </div>
                    </div>
                    <Tag variant={statusConfig[p.status].variant}>
                      {statusConfig[p.status].label}
                    </Tag>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-gray-500 mb-2">{p.notes}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(p.createTime, 'HH:mm')}登记
                    </span>
                    {p.status !== 'completed' && (
                      <button
                        onClick={() => updateSpecialPassengerStatus(p.id, p.status === 'waiting' ? 'boarding' : 'completed')}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        {p.status === 'waiting' ? '引导检票' : '确认上车'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="候车区容量对比">
          <ReactECharts
            option={{
              tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
              },
              legend: { data: ['容量', '当前人数'], bottom: 0 },
              grid: { left: '3%', right: '4%', bottom: '15%', top: '5%', containLabel: true },
              xAxis: {
                type: 'category',
                data: waitingAreas.map((a) => a.name),
              },
              yAxis: { type: 'value' },
              series: [
                {
                  name: '容量',
                  type: 'bar',
                  data: waitingAreas.map((a) => a.capacity),
                  itemStyle: { color: '#e5e7eb', borderRadius: [4, 4, 0, 0] },
                  barGap: '-100%',
                  barWidth: '40%',
                },
                {
                  name: '当前人数',
                  type: 'bar',
                  data: waitingAreas.map((a) => a.current),
                  itemStyle: {
                    color: (params: any) => {
                      const saturation = (params.value / waitingAreas[params.dataIndex].capacity) * 100;
                      if (saturation >= 80) return '#ef4444';
                      if (saturation >= 60) return '#facc15';
                      return '#22c55e';
                    },
                    borderRadius: [4, 4, 0, 0],
                  },
                  barWidth: '40%',
                },
              ],
            }}
            style={{ height: '280px' }}
          />
        </Card>

        <Card title="换乘引导">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">1号线换乘通道</span>
              </div>
              <p className="text-sm text-blue-700 mb-2">当前通行正常，建议从A候车区北侧进入</p>
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <span>步行距离: 200米</span>
                <span>预计时间: 3分钟</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">2号线换乘通道</span>
              </div>
              <p className="text-sm text-yellow-700 mb-2">临时维护中，请从1号线换乘通道绕行</p>
              <div className="flex items-center gap-4 text-xs text-yellow-600">
                <span>步行距离: 350米</span>
                <span>预计时间: 6分钟</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">长途汽车站接驳</span>
              </div>
              <p className="text-sm text-green-700 mb-2">从出站口B口出站，直行100米即到</p>
              <div className="flex items-center gap-4 text-xs text-green-600">
                <span>步行距离: 150米</span>
                <span>预计时间: 2分钟</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">登记重点旅客</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">旅客姓名</label>
                <input
                  type="text"
                  value={newPassenger.name}
                  onChange={(e) => setNewPassenger({ ...newPassenger, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="请输入姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">旅客类型</label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(passengerTypeConfig) as SpecialPassengerType[]).map((type) => {
                    const config = passengerTypeConfig[type];
                    const TypeIcon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewPassenger({ ...newPassenger, type })}
                        className={cn(
                          'p-2 rounded-lg border flex flex-col items-center gap-1 transition-all',
                          newPassenger.type === type
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <TypeIcon className="w-4 h-4" />
                        <span className="text-xs">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">车次</label>
                  <input
                    type="text"
                    value={newPassenger.trainNumber}
                    onChange={(e) => setNewPassenger({ ...newPassenger, trainNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="如G101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">座位号</label>
                  <input
                    type="text"
                    value={newPassenger.seatNumber}
                    onChange={(e) => setNewPassenger({ ...newPassenger, seatNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="如05车08A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                <input
                  type="text"
                  value={newPassenger.contact}
                  onChange={(e) => setNewPassenger({ ...newPassenger, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="请输入联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">特殊需求</label>
                <textarea
                  value={newPassenger.notes}
                  onChange={(e) => setNewPassenger({ ...newPassenger, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={2}
                  placeholder="请描述特殊需求"
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
                onClick={handleAddPassenger}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
