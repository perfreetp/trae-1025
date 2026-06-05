import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Users,
  LogIn,
  LogOut,
  AlertTriangle,
  TrendingUp,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import { mockHourlyFlow, mockStationCompare } from '@/mock';
import { format } from 'date-fns';

export default function Dashboard() {
  const { passengerFlow, peakWarning, waitingAreas } = useAppStore();
  const [selectedStations, setSelectedStations] = useState(['st1', 'st2']);

  const warningColors = {
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    orange: 'bg-orange-100 border-orange-300 text-orange-800',
    red: 'bg-red-100 border-red-300 text-red-800',
  };

  const warningLevelText = {
    yellow: '黄色预警',
    orange: '橙色预警',
    red: '红色预警',
  };

  const hourlyFlowOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
    },
    legend: {
      data: ['进站人数', '出站人数'],
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
      data: mockHourlyFlow.map((d) => `${d.hour}:00`),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: { color: '#6b7280' },
    },
    series: [
      {
        name: '进站人数',
        type: 'bar',
        data: mockHourlyFlow.map((d) => d.inCount),
        itemStyle: { color: '#0F3460', borderRadius: [4, 4, 0, 0] },
        barWidth: '35%',
      },
      {
        name: '出站人数',
        type: 'bar',
        data: mockHourlyFlow.map((d) => d.outCount),
        itemStyle: { color: '#16C79A', borderRadius: [4, 4, 0, 0] },
        barWidth: '35%',
      },
    ],
  };

  const heatmapOption = {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
    },
    grid: {
      height: '70%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      splitArea: { show: true },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'category',
      data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      splitArea: { show: true },
      axisLabel: { color: '#6b7280' },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#e0f2fe', '#7dd3fc', '#0ea5e9', '#0369a1', '#0F3460'],
      },
      textStyle: { color: '#6b7280' },
    },
    series: [
      {
        name: '客流密度',
        type: 'heatmap',
        data: waitingAreas[0].heatmapData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {peakWarning && (
        <div className={`p-4 rounded-lg border-2 ${warningColors[peakWarning.level]} animate-pulse-slow`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold">{warningLevelText[peakWarning.level]}</span>
                <span className="text-sm opacity-80">
                  预计峰值时间: {format(peakWarning.forecastTime, 'HH:mm')}
                </span>
                <span className="text-sm opacity-80">
                  预计客流: {peakWarning.forecastCount}人
                </span>
              </div>
              <p className="font-medium mb-2">{peakWarning.message}</p>
              <div className="text-sm">
                <span className="font-medium">建议措施: </span>
                {peakWarning.suggestions.join('；')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="今日进站人数"
          value={passengerFlow.inCount.toLocaleString()}
          icon={LogIn}
          trend={{ value: 8.5, isUp: true }}
          color="blue"
        />
        <StatCard
          title="今日出站人数"
          value={passengerFlow.outCount.toLocaleString()}
          icon={LogOut}
          trend={{ value: 6.2, isUp: true }}
          color="green"
        />
        <StatCard
          title="当前在站人数"
          value={passengerFlow.inStation.toLocaleString()}
          icon={Users}
          color="orange"
        />
        <StatCard
          title="候车区平均饱和度"
          value={`${Math.round(waitingAreas.reduce((a, b) => a + b.saturation, 0) / waitingAreas.length)}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card title="24小时客流趋势" className="col-span-2">
          <ReactECharts option={hourlyFlowOption} style={{ height: '320px' }} />
        </Card>

        <Card title="候车区客流热力图">
          <ReactECharts option={heatmapOption} style={{ height: '320px' }} />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card title="各区域客流分布">
          <div className="space-y-4">
            {Object.entries(passengerFlow.areaDistribution).map(([area, count]) => {
              const maxCount = Math.max(...Object.values(passengerFlow.areaDistribution));
              const percentage = (count / maxCount) * 100;
              return (
                <div key={area}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{area}</span>
                    <span className="text-sm font-medium text-gray-900">{count}人</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          title="多站对比"
          className="col-span-2"
          headerExtra={
            <div className="relative">
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <Building2 className="w-4 h-4" />
                <span>选择对比车站</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-4 gap-4">
            {mockStationCompare
              .filter((s) => selectedStations.includes(s.id))
              .map((station) => (
                <div
                  key={station.id}
                  className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-primary-200 transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-gray-900 mb-3">{station.name}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">进站</span>
                      <span className="font-medium">{station.inCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">出站</span>
                      <span className="font-medium">{station.outCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">在站</span>
                      <span className="font-medium">{station.inStation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">饱和度</span>
                      <Tag variant={station.saturation > 65 ? 'warning' : 'success'}>
                        {station.saturation}%
                      </Tag>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">事件</span>
                      <Tag variant={station.events > 3 ? 'danger' : station.events > 0 ? 'warning' : 'success'}>
                        {station.events}件
                      </Tag>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
