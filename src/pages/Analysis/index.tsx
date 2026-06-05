import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  FileText,
  Train,
  Wrench,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store/useAppStore';
import { mockDailyReport, mockHourlyFlow } from '@/mock';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Analysis() {
  const { trainForecasts, events, gateDevices } = useAppStore();
  const [activeTab, setActiveTab] = useState<'forecast' | 'comparison' | 'report' | 'equipment'>('forecast');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const resolvedEvents = events.filter((e) => e.status === 'resolved' || e.status === 'closed').length;
  const faultDevices = gateDevices.filter((g) => g.status === 'fault').length;

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    },
    legend: {
      data: ['进站人数', '出站人数', '去年同期'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: mockHourlyFlow.map((d) => `${d.hour}:00`),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: '进站人数',
        type: 'line',
        smooth: true,
        data: mockHourlyFlow.map((d) => d.inCount),
        itemStyle: { color: '#0F3460' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(15, 52, 96, 0.3)' },
              { offset: 1, color: 'rgba(15, 52, 96, 0.05)' },
            ],
          },
        },
      },
      {
        name: '出站人数',
        type: 'line',
        smooth: true,
        data: mockHourlyFlow.map((d) => d.outCount),
        itemStyle: { color: '#16C79A' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 199, 154, 0.3)' },
              { offset: 1, color: 'rgba(22, 199, 154, 0.05)' },
            ],
          },
        },
      },
      {
        name: '去年同期',
        type: 'line',
        smooth: true,
        lineStyle: { type: 'dashed', width: 2, color: '#9CA3AF' },
        data: mockHourlyFlow.map((d) => d.inCount * 0.85),
        itemStyle: { color: '#9CA3AF' },
      },
    ],
  };

  const eventTypeOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: events.filter((e) => e.type === 'congestion').length, name: '客流拥堵', itemStyle: { color: '#F97316' } },
          { value: events.filter((e) => e.type === 'equipment').length, name: '设备故障', itemStyle: { color: '#3B82F6' } },
          { value: events.filter((e) => e.type === 'passenger').length, name: '旅客事件', itemStyle: { color: '#A855F7' } },
          { value: events.filter((e) => e.type === 'security').length, name: '安保事件', itemStyle: { color: '#EF4444' } },
          { value: events.filter((e) => e.type === 'other').length, name: '其他事件', itemStyle: { color: '#6B7280' } },
        ],
      },
    ],
  };

  const weekComparisonOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
    },
    legend: {
      data: ['本周', '上周', '上月同期'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: '本周',
        type: 'bar',
        data: [42500, 45200, 48700, 51200, 54800, 62300, 58900],
        itemStyle: { color: '#0F3460', borderRadius: [4, 4, 0, 0] },
        barWidth: '25%',
      },
      {
        name: '上周',
        type: 'bar',
        data: [40200, 43800, 46500, 49800, 52300, 59800, 56200],
        itemStyle: { color: '#94A3B8', borderRadius: [4, 4, 0, 0] },
        barWidth: '25%',
      },
      {
        name: '上月同期',
        type: 'line',
        data: [38500, 41200, 44300, 47800, 50200, 57600, 54100],
        itemStyle: { color: '#E94560' },
        lineStyle: { width: 2 },
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-b border-gray-200 -mb-px">
          {[
            { key: 'forecast', label: '客流预测', icon: TrendingUp },
            { key: 'comparison', label: '数据对比', icon: BarChart3 },
            { key: 'report', label: '日报生成', icon: FileText },
            { key: 'equipment', label: '设备分析', icon: Wrench },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-4 py-3 flex items-center gap-2 border-b-2 transition-colors',
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {range === 'day' ? '日' : range === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              <span>{format(selectedDate, 'yyyy年MM月dd日')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            刷新数据
          </button>
        </div>
      </div>

      {activeTab === 'forecast' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Train className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">预测车次</p>
                <p className="text-2xl font-bold text-gray-900">{trainForecasts.length}<span className="text-sm font-normal text-gray-500">列</span></p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">预计发送旅客</p>
                <p className="text-2xl font-bold text-green-600">
                  {trainForecasts.reduce((sum, t) => sum + t.forecastPassengers, 0).toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">人</span>
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">高峰车次</p>
                <p className="text-2xl font-bold text-purple-600">
                  {trainForecasts.filter((t) => t.forecastPassengers > 800).length}
                  <span className="text-sm font-normal text-gray-500">列</span>
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均置信度</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(trainForecasts.reduce((sum, t) => sum + t.confidence, 0) / trainForecasts.length * 100)}
                  <span className="text-sm font-normal text-gray-500">%</span>
                </p>
              </div>
            </Card>
          </div>

          <Card title="客流趋势预测">
            <ReactECharts option={trendOption} style={{ height: '350px' }} />
          </Card>

          <Card title="车次客流预测">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">车次</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">发车时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">检票口</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">预测客流</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">置信度</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {trainForecasts.map((train) => (
                    <tr key={train.trainNumber} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-primary-600">{train.trainNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {format(train.departureTime, 'HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{train.checkPoint}检票口</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{train.forecastPassengers}</span>
                        <span className="text-sm text-gray-500 ml-1">人</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                train.confidence >= 0.9 ? 'bg-green-500' :
                                train.confidence >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${train.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(train.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {train.forecastPassengers > 800 ? (
                          <Tag variant="warning">大客流</Tag>
                        ) : train.forecastPassengers > 600 ? (
                          <Tag variant="info">正常</Tag>
                        ) : (
                          <Tag variant="success">较小</Tag>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'comparison' && (
        <div className="grid grid-cols-2 gap-6">
          <Card title="周客流对比">
            <ReactECharts option={weekComparisonOption} style={{ height: '350px' }} />
          </Card>

          <Card title="事件类型分布">
            <ReactECharts option={eventTypeOption} style={{ height: '350px' }} />
          </Card>

          <Card title="关键指标对比" className="col-span-2">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '今日进站', value: mockDailyReport.totalIn.toLocaleString(), trend: 8.5, unit: '人' },
                { label: '今日出站', value: mockDailyReport.totalOut.toLocaleString(), trend: 6.2, unit: '人' },
                { label: '峰值小时', value: `${mockDailyReport.peakInHour}:00`, trend: 0, unit: '' },
                { label: '峰值人数', value: mockDailyReport.peakInCount.toLocaleString(), trend: 12.3, unit: '人' },
                { label: '事件总数', value: mockDailyReport.events, trend: -15.2, unit: '件' },
                { label: '已解决', value: mockDailyReport.resolvedEvents, trend: -10.5, unit: '件' },
                { label: '设备故障', value: mockDailyReport.equipmentFaults, trend: 5.8, unit: '次' },
                { label: '平均修复', value: mockDailyReport.avgRepairTime, trend: -8.3, unit: '分钟' },
              ].map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                    {item.unit && <span className="text-sm text-gray-500">{item.unit}</span>}
                  </div>
                  {item.trend !== 0 && (
                    <div className="mt-1">
                      <span className={cn(
                        'text-sm font-medium',
                        item.trend > 0 ? 'text-red-600' : 'text-green-600'
                      )}>
                        {item.trend > 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
                      </span>
                      <span className="text-xs text-gray-400 ml-1">较昨日</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="grid grid-cols-3 gap-6">
          <Card title="日报预览" className="col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">车站客流组织日报</h2>
                <p className="text-sm text-gray-500 mt-1">{format(selectedDate, 'yyyy年MM月dd日')}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">一、客流概况</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">进站人数</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.totalIn.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">出站人数</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.totalOut.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">峰值时段</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.peakInHour}:00</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">峰值人数</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.peakInCount}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">二、事件处置</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">事件总数</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.events}件</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">已解决</p>
                      <p className="text-lg font-bold text-green-600">{mockDailyReport.resolvedEvents}件</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">三、设备运行</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">设备故障</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.equipmentFaults}次</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500">平均修复时间</p>
                      <p className="text-lg font-bold text-gray-900">{mockDailyReport.avgRepairTime}分钟</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="报表导出">
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  导出 PDF 格式
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  导出 Excel 格式
                </button>
                <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  打印报表
                </button>
              </div>
            </Card>

            <Card title="历史报表">
              <div className="space-y-2">
                {['2024年01月15日', '2024年01月14日', '2024年01月13日', '2024年01月12日', '2024年01月11日'].map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-700">{date}日报</span>
                    <Download className="w-4 h-4 text-gray-400 hover:text-primary-500" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="grid grid-cols-3 gap-6">
          <Card title="设备运行状态">
            <ReactECharts
              option={{
                tooltip: { trigger: 'item' },
                series: [
                  {
                    type: 'pie',
                    radius: ['50%', '75%'],
                    center: ['50%', '50%'],
                    itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                    label: {
                      show: true,
                      position: 'outside',
                      formatter: '{b}\n{c}台',
                    },
                    data: [
                      { value: gateDevices.filter((g) => g.status === 'normal').length, name: '正常运行', itemStyle: { color: '#22C55E' } },
                      { value: gateDevices.filter((g) => g.status === 'fault').length, name: '故障', itemStyle: { color: '#EF4444' } },
                      { value: gateDevices.filter((g) => g.status === 'closed').length, name: '关闭', itemStyle: { color: '#9CA3AF' } },
                    ],
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>

          <Card title="设备故障率趋势">
            <ReactECharts
              option={{
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: {
                  type: 'category',
                  data: ['1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16'],
                  axisLine: { lineStyle: { color: '#e5e7eb' } },
                },
                yAxis: {
                  type: 'value',
                  name: '故障次数',
                  axisLine: { show: false },
                  splitLine: { lineStyle: { color: '#f3f4f6' } },
                },
                series: [
                  {
                    type: 'line',
                    smooth: true,
                    data: [5, 3, 4, 6, 2, 3, 2],
                    itemStyle: { color: '#E94560' },
                    lineStyle: { width: 3 },
                    areaStyle: {
                      color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                          { offset: 0, color: 'rgba(233, 69, 96, 0.3)' },
                          { offset: 1, color: 'rgba(233, 69, 96, 0.05)' },
                        ],
                      },
                    },
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>

          <Card title="设备类型分布">
            <ReactECharts
              option={{
                tooltip: { trigger: 'item' },
                legend: { orient: 'vertical', right: '5%', top: 'center' },
                series: [
                  {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['35%', '50%'],
                    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                    data: [
                      { value: 12, name: '闸机设备', itemStyle: { color: '#0F3460' } },
                      { value: 8, name: '安检设备', itemStyle: { color: '#16C79A' } },
                      { value: 6, name: '电梯扶梯', itemStyle: { color: '#E94560' } },
                      { value: 10, name: '广播系统', itemStyle: { color: '#F59E0B' } },
                      { value: 15, name: '监控设备', itemStyle: { color: '#8B5CF6' } },
                    ],
                  },
                ],
              }}
              style={{ height: '300px' }}
            />
          </Card>

          <Card title="设备故障详情" className="col-span-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">设备名称</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">设备类型</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">位置</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">故障时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">故障类型</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">修复时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {gateDevices.filter((g) => g.status === 'fault').map((device) => (
                    <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{device.name}</td>
                      <td className="py-3 px-4 text-gray-700">闸机</td>
                      <td className="py-3 px-4 text-gray-700">A2检票口</td>
                      <td className="py-3 px-4 text-gray-700">09:25</td>
                      <td className="py-3 px-4 text-gray-700">传感器故障</td>
                      <td className="py-3 px-4 text-yellow-600">修复中...</td>
                      <td className="py-3 px-4">
                        <Tag variant="warning">处理中</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
