import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  ScanLine,
  CheckCircle,
  XCircle,
  Power,
  PowerOff,
  AlertCircle,
  BarChart3,
  Clock,
  Users as UsersIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function GateMonitor() {
  const { gateDevices, checkPoints, toggleCheckPoint } = useAppStore();
  const [selectedCheckPoint, setSelectedCheckPoint] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const statusConfig = {
    normal: { label: '正常', variant: 'success' as const, icon: CheckCircle, color: 'text-green-500' },
    fault: { label: '故障', variant: 'danger' as const, icon: XCircle, color: 'text-red-500' },
    closed: { label: '关闭', variant: 'default' as const, icon: PowerOff, color: 'text-gray-400' },
  };

  const handleToggleCheckPoint = (id: string, currentStatus: string) => {
    if (showConfirm === id) {
      toggleCheckPoint(id);
      setShowConfirm(null);
    } else {
      setShowConfirm(id);
      setTimeout(() => setShowConfirm(null), 3000);
    }
  };

  const normalCount = gateDevices.filter((g) => g.status === 'normal').length;
  const faultCount = gateDevices.filter((g) => g.status === 'fault').length;
  const closedCount = gateDevices.filter((g) => g.status === 'closed').length;

  const gateStatsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    },
    legend: {
      data: ['过闸人数', '平均排队时长'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: checkPoints.map((cp) => cp.name),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '人数',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: '分钟',
        axisLine: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '过闸人数',
        type: 'bar',
        data: checkPoints.map((cp) =>
          gateDevices
            .filter((g) => g.checkPointId === cp.id)
            .reduce((sum, g) => sum + g.passengerCount, 0)
        ),
        itemStyle: { color: '#0F3460', borderRadius: [4, 4, 0, 0] },
        barWidth: '40%',
      },
      {
        name: '平均排队时长',
        type: 'line',
        yAxisIndex: 1,
        data: checkPoints.map((cp) => {
          const gates = gateDevices.filter((g) => g.checkPointId === cp.id);
          const avgQueue = gates.length > 0
            ? gates.reduce((sum, g) => sum + g.queueLength, 0) / gates.length
            : 0;
          return avgQueue.toFixed(1);
        }),
        itemStyle: { color: '#E94560' },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 8,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">正常运行</p>
            <p className="text-2xl font-bold text-gray-900">{normalCount}<span className="text-sm font-normal text-gray-500">/{gateDevices.length}台</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">设备故障</p>
            <p className="text-2xl font-bold text-gray-900">{faultCount}<span className="text-sm font-normal text-gray-500">台</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
            <PowerOff className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已关闭</p>
            <p className="text-2xl font-bold text-gray-900">{closedCount}<span className="text-sm font-normal text-gray-500">台</span></p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">今日累计过闸</p>
            <p className="text-2xl font-bold text-gray-900">
              {gateDevices.reduce((sum, g) => sum + g.passengerCount, 0).toLocaleString()}
              <span className="text-sm font-normal text-gray-500">人次</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card title="检票口控制" className="col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {checkPoints.map((cp) => (
              <div
                key={cp.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all cursor-pointer',
                  cp.status === 'open'
                    ? 'border-green-200 bg-green-50 hover:border-green-300'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                  selectedCheckPoint === cp.id ? 'ring-2 ring-primary-300' : ''
                )}
                onClick={() => setSelectedCheckPoint(cp.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{cp.name}</h4>
                  <Tag variant={cp.status === 'open' ? 'success' : 'default'}>
                    {cp.status === 'open' ? '开放中' : '已关闭'}
                  </Tag>
                </div>

                {cp.trainNumber && (
                  <div className="mb-3 p-2 bg-white rounded text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ScanLine className="w-4 h-4" />
                      <span className="font-medium text-primary-600">{cp.trainNumber}</span>
                      {cp.departureTime && (
                        <span className="text-gray-500">
                          {format(cp.departureTime, 'HH:mm')}开
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>闸机数: {cp.gateCount}台</span>
                  <span>
                    排队: {
                      gateDevices
                        .filter((g) => g.checkPointId === cp.id)
                        .reduce((sum, g) => sum + g.queueLength, 0)
                    }人
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCheckPoint(cp.id, cp.status);
                  }}
                  className={cn(
                    'w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                    cp.status === 'open'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200',
                    showConfirm === cp.id && 'ring-2 ring-offset-2 ring-red-400'
                  )}
                >
                  {cp.status === 'open' ? (
                    <>
                      <PowerOff className="w-4 h-4" />
                      {showConfirm === cp.id ? '再次点击确认关闭' : '关闭检票口'}
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      {showConfirm === cp.id ? '再次点击确认开启' : '开启检票口'}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="闸机状态统计">
          <ReactECharts option={gateStatsOption} style={{ height: '300px' }} />
        </Card>
      </div>

      <Card title="闸机设备详情">
        <div className="grid grid-cols-6 gap-3">
          {gateDevices.map((gate) => {
            const config = statusConfig[gate.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={gate.id}
                className={cn(
                  'p-3 rounded-lg border transition-all hover:shadow-md',
                  gate.status === 'normal' ? 'border-green-200 bg-green-50/50' :
                  gate.status === 'fault' ? 'border-red-200 bg-red-50/50' :
                  'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{gate.name}</span>
                  <StatusIcon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">过闸人数</span>
                    <span className="font-medium">{gate.passengerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">排队长度</span>
                    <span className="font-medium">{gate.queueLength}人</span>
                  </div>
                </div>
                {gate.status === 'fault' && (
                  <button className="mt-2 w-full py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    上报维修
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="过闸客流趋势">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ReactECharts
              option={{
                tooltip: { trigger: 'axis' },
                legend: { data: checkPoints.map((cp) => cp.name), bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '15%', top: '5%', containLabel: true },
                xAxis: {
                  type: 'category',
                  data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                },
                yAxis: { type: 'value' },
                series: checkPoints.map((cp, index) => ({
                  name: cp.name,
                  type: 'line',
                  smooth: true,
                  data: [120, 280, 450, 320, 280, 380, 520, 410, 250].map((v) => v - index * 30 + Math.floor(Math.random() * 50)),
                  lineStyle: { width: 2 },
                })),
              }}
              style={{ height: '280px' }}
            />
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              实时数据
            </h4>
            {checkPoints.slice(0, 4).map((cp) => (
              <div key={cp.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{cp.name}</span>
                  <Tag variant={cp.status === 'open' ? 'success' : 'default'}>
                    {cp.status === 'open' ? '开放' : '关闭'}
                  </Tag>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>通过率 98.5%</span>
                  <span>平均等待 1.2分钟</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
