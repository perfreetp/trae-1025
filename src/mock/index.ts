import type {
  PassengerFlow,
  GateDevice,
  CheckPoint,
  WaitingArea,
  SpecialPassenger,
  BroadcastTemplate,
  BroadcastRecord,
  Staff,
  Schedule,
  PatrolRecord,
  Event,
  TrainForecast,
  DailyReport,
  StationCompare,
  PeakWarning,
} from '@/types';

const now = new Date();

export const mockPassengerFlow: PassengerFlow = {
  id: '1',
  timestamp: now,
  inCount: 12580,
  outCount: 10234,
  inStation: 4521,
  areaDistribution: {
    'A候车区': 1200,
    'B候车区': 980,
    'C候车区': 750,
    'D候车区': 620,
    '进站口': 450,
    '出站口': 320,
    '换乘通道': 201,
  },
};

export const mockGateDevices: GateDevice[] = [
  { id: 'g1', name: 'A1-1', status: 'normal', passengerCount: 856, queueLength: 3, checkPointId: 'cp1' },
  { id: 'g2', name: 'A1-2', status: 'normal', passengerCount: 792, queueLength: 2, checkPointId: 'cp1' },
  { id: 'g3', name: 'A1-3', status: 'normal', passengerCount: 901, queueLength: 5, checkPointId: 'cp1' },
  { id: 'g4', name: 'A2-1', status: 'normal', passengerCount: 654, queueLength: 1, checkPointId: 'cp2' },
  { id: 'g5', name: 'A2-2', status: 'fault', passengerCount: 0, queueLength: 0, checkPointId: 'cp2' },
  { id: 'g6', name: 'A2-3', status: 'normal', passengerCount: 723, queueLength: 4, checkPointId: 'cp2' },
  { id: 'g7', name: 'B1-1', status: 'normal', passengerCount: 521, queueLength: 2, checkPointId: 'cp3' },
  { id: 'g8', name: 'B1-2', status: 'closed', passengerCount: 0, queueLength: 0, checkPointId: 'cp3' },
  { id: 'g9', name: 'B2-1', status: 'normal', passengerCount: 634, queueLength: 3, checkPointId: 'cp4' },
  { id: 'g10', name: 'B2-2', status: 'normal', passengerCount: 589, queueLength: 2, checkPointId: 'cp4' },
  { id: 'g11', name: 'C1-1', status: 'normal', passengerCount: 445, queueLength: 1, checkPointId: 'cp5' },
  { id: 'g12', name: 'C1-2', status: 'normal', passengerCount: 412, queueLength: 1, checkPointId: 'cp5' },
];

export const mockCheckPoints: CheckPoint[] = [
  { id: 'cp1', name: 'A1检票口', status: 'open', gateCount: 3, trainNumber: 'G101', departureTime: new Date(now.getTime() + 30 * 60000) },
  { id: 'cp2', name: 'A2检票口', status: 'open', gateCount: 3, trainNumber: 'G203', departureTime: new Date(now.getTime() + 45 * 60000) },
  { id: 'cp3', name: 'B1检票口', status: 'open', gateCount: 2, trainNumber: 'D305', departureTime: new Date(now.getTime() + 20 * 60000) },
  { id: 'cp4', name: 'B2检票口', status: 'closed', gateCount: 2 },
  { id: 'cp5', name: 'C1检票口', status: 'open', gateCount: 2, trainNumber: 'G407', departureTime: new Date(now.getTime() + 60 * 60000) },
];

const generateHeatmapData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      data.push([i, j, Math.floor(Math.random() * 100)]);
    }
  }
  return data;
};

export const mockWaitingAreas: WaitingArea[] = [
  { id: 'wa1', name: 'A候车区', capacity: 2000, current: 1200, saturation: 60, heatmapData: generateHeatmapData() },
  { id: 'wa2', name: 'B候车区', capacity: 1800, current: 980, saturation: 54, heatmapData: generateHeatmapData() },
  { id: 'wa3', name: 'C候车区', capacity: 1500, current: 750, saturation: 50, heatmapData: generateHeatmapData() },
  { id: 'wa4', name: 'D候车区', capacity: 1200, current: 620, saturation: 52, heatmapData: generateHeatmapData() },
];

export const mockSpecialPassengers: SpecialPassenger[] = [
  { id: 'sp1', name: '张奶奶', type: 'elderly', contact: '138****1234', trainNumber: 'G101', seatNumber: '05车08A', status: 'waiting', notes: '需要轮椅接送', createTime: new Date(now.getTime() - 30 * 60000) },
  { id: 'sp2', name: '李先生', type: 'disabled', contact: '139****5678', trainNumber: 'G203', seatNumber: '03车12C', status: 'boarding', notes: '视力障碍，需要引导', createTime: new Date(now.getTime() - 45 * 60000) },
  { id: 'sp3', name: '王女士', type: 'pregnant', trainNumber: 'D305', seatNumber: '08车05F', status: 'waiting', notes: '怀孕8个月', createTime: new Date(now.getTime() - 15 * 60000) },
  { id: 'sp4', name: '小明', type: 'child', contact: '137****9012', trainNumber: 'G407', seatNumber: '02车03B', status: 'waiting', notes: '无人陪同儿童，10岁', createTime: new Date(now.getTime() - 60 * 60000) },
];

export const mockBroadcastTemplates: BroadcastTemplate[] = [
  { id: 'bt1', name: '开始检票', category: 'checkin', content: '各位旅客请注意，开往{方向}的{车次}次列车现在开始检票，请持有{车次}次列车车票的旅客到{检票口}检票上车，祝您旅途愉快。' },
  { id: 'bt2', name: '停止检票', category: 'checkin', content: '各位旅客请注意，开往{方向}的{车次}次列车很快就要开车了，还有没检票的旅客请您抓紧时间到{检票口}检票上车。' },
  { id: 'bt3', name: '列车晚点', category: 'delay', content: '各位旅客请注意，我们抱歉地通知，原定{时间}开的{车次}次列车，由于{原因}，列车晚点约{时长}分钟，晚点给您带来不便，请您谅解。' },
  { id: 'bt4', name: '寻人广播', category: 'paging', content: '{姓名}旅客请注意，听到广播后请您到{地点}，您的家人在等您，谢谢。' },
  { id: 'bt5', name: '安全提示', category: 'notice', content: '各位旅客，为了您和他人的安全，请不要在站台上奔跑、追逐，看管好您的行李物品，照顾好身边的老人和小孩。' },
  { id: 'bt6', name: '紧急疏散', category: 'emergency', content: '各位旅客请注意，现在进行紧急疏散，请您按照工作人员的指引，有序撤离到安全区域，不要惊慌。' },
];

export const mockBroadcastRecords: BroadcastRecord[] = [
  { id: 'br1', templateId: 'bt1', content: '各位旅客请注意，开往北京南的G101次列车现在开始检票...', area: ['A候车区', 'A1检票口'], operator: '张三', playTime: new Date(now.getTime() - 10 * 60000), status: 'completed', source: 'template' },
  { id: 'br2', templateId: 'bt5', content: '各位旅客，为了您和他人的安全...', area: ['全站'], operator: '李四', playTime: new Date(now.getTime() - 25 * 60000), status: 'completed', source: 'template' },
  { id: 'br3', content: '请前往2号站台的旅客注意，2号站台临时调整，请改乘天桥通行', area: ['进站口', '换乘通道'], operator: '王五', playTime: new Date(now.getTime() - 5 * 60000), status: 'completed', source: 'custom' },
  { id: 'br4', templateId: 'bt4', content: '请王建国旅客听到广播后到服务台...', area: ['B候车区'], operator: '张三', playTime: new Date(now.getTime() - 2 * 60000), status: 'playing', source: 'template' },
];

export const mockStaff: Staff[] = [
  { id: 's1', name: '张伟', position: '值班站长', phone: '138****0001', status: 'on_duty', currentPost: '站长室' },
  { id: 's2', name: '李娜', position: '客运值班员', phone: '138****0002', status: 'on_duty', currentPost: 'A候车区' },
  { id: 's3', name: '王强', position: '客运值班员', phone: '138****0003', status: 'on_duty', currentPost: 'B候车区' },
  { id: 's4', name: '刘芳', position: '检票员', phone: '138****0004', status: 'on_duty', currentPost: 'A1检票口' },
  { id: 's5', name: '陈明', position: '检票员', phone: '138****0005', status: 'on_duty', currentPost: 'A2检票口' },
  { id: 's6', name: '赵丽', position: '服务台', phone: '138****0006', status: 'on_duty', currentPost: '服务台' },
  { id: 's7', name: '孙涛', position: '安保员', phone: '138****0007', status: 'rest' },
  { id: 's8', name: '周杰', position: '安检员', phone: '138****0008', status: 'on_duty', currentPost: '进站口' },
  { id: 's9', name: '吴敏', position: '保洁员', phone: '138****0009', status: 'off_duty' },
];

export const mockSchedules: Schedule[] = [
  { id: 'sc1', staffId: 's1', date: now, shift: 'morning', post: '站长室' },
  { id: 'sc2', staffId: 's2', date: now, shift: 'morning', post: 'A候车区' },
  { id: 'sc3', staffId: 's3', date: now, shift: 'morning', post: 'B候车区' },
  { id: 'sc4', staffId: 's4', date: now, shift: 'morning', post: 'A1检票口' },
  { id: 'sc5', staffId: 's5', date: now, shift: 'afternoon', post: 'A2检票口' },
  { id: 'sc6', staffId: 's6', date: now, shift: 'morning', post: '服务台' },
  { id: 'sc7', staffId: 's8', date: now, shift: 'morning', post: '进站口' },
];

export const mockPatrolRecords: PatrolRecord[] = [
  { id: 'p1', staffId: 's2', checkpoint: 'A候车区-1号点位', timestamp: new Date(now.getTime() - 45 * 60000), location: { lat: 39.9042, lng: 116.4074 } },
  { id: 'p2', staffId: 's2', checkpoint: 'A候车区-2号点位', timestamp: new Date(now.getTime() - 30 * 60000), location: { lat: 39.9043, lng: 116.4075 } },
  { id: 'p3', staffId: 's3', checkpoint: 'B候车区-1号点位', timestamp: new Date(now.getTime() - 40 * 60000), location: { lat: 39.9044, lng: 116.4076 } },
  { id: 'p4', staffId: 's2', checkpoint: 'A候车区-3号点位', timestamp: new Date(now.getTime() - 15 * 60000), location: { lat: 39.9045, lng: 116.4077 } },
  { id: 'p5', staffId: 's3', checkpoint: 'B候车区-2号点位', timestamp: new Date(now.getTime() - 20 * 60000), location: { lat: 39.9046, lng: 116.4078 } },
];

export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'A2检票口闸机故障',
    type: 'equipment',
    severity: 'medium',
    location: 'A2检票口',
    description: 'A2-2号闸机刷卡无反应，指示灯不亮',
    reporter: '陈明',
    reportTime: new Date(now.getTime() - 35 * 60000),
    handler: '维修组',
    status: 'processing',
    progress: 60,
    updates: [
      { id: 'eu1', eventId: 'e1', content: '已接到报修，技术人员正在赶往现场', operator: '调度中心', timestamp: new Date(now.getTime() - 30 * 60000) },
      { id: 'eu2', eventId: 'e1', content: '技术人员已到达，正在检测故障原因', operator: '维修组', timestamp: new Date(now.getTime() - 20 * 60000) },
      { id: 'eu3', eventId: 'e1', content: '确认是传感器故障，正在更换配件', operator: '维修组', timestamp: new Date(now.getTime() - 10 * 60000) },
    ],
  },
  {
    id: 'e2',
    title: 'A候车区旅客拥堵',
    type: 'congestion',
    severity: 'high',
    location: 'A候车区中部',
    description: 'G101次检票前旅客聚集，客流密度较大',
    reporter: '李娜',
    reportTime: new Date(now.getTime() - 15 * 60000),
    handler: '李娜',
    status: 'processing',
    progress: 40,
    updates: [
      { id: 'eu4', eventId: 'e2', content: '已增派人员现场疏导', operator: '李娜', timestamp: new Date(now.getTime() - 12 * 60000) },
      { id: 'eu5', eventId: 'e2', content: '已开启临时通道，分流部分旅客', operator: '李娜', timestamp: new Date(now.getTime() - 5 * 60000) },
    ],
  },
  {
    id: 'e3',
    title: '旅客晕倒需救助',
    type: 'passenger',
    severity: 'critical',
    location: 'B候车区座椅区',
    description: '一名老年旅客突然晕倒，意识不清',
    reporter: '王强',
    reportTime: new Date(now.getTime() - 8 * 60000),
    handler: '王强',
    status: 'processing',
    progress: 75,
    updates: [
      { id: 'eu6', eventId: 'e3', content: '已拨打120急救电话', operator: '王强', timestamp: new Date(now.getTime() - 7 * 60000) },
      { id: 'eu7', eventId: 'e3', content: '医护人员已到达，正在进行急救', operator: '王强', timestamp: new Date(now.getTime() - 3 * 60000) },
    ],
  },
  {
    id: 'e4',
    title: '旅客遗失物品',
    type: 'other',
    severity: 'low',
    location: '服务台',
    description: '旅客遗失黑色背包一个，内有笔记本电脑',
    reporter: '赵丽',
    reportTime: new Date(now.getTime() - 120 * 60000),
    handler: '赵丽',
    status: 'resolved',
    progress: 100,
    updates: [
      { id: 'eu8', eventId: 'e4', content: '已登记遗失物品信息', operator: '赵丽', timestamp: new Date(now.getTime() - 115 * 60000) },
      { id: 'eu9', eventId: 'e4', content: '已联系到失主，物品已归还', operator: '赵丽', timestamp: new Date(now.getTime() - 60 * 60000) },
    ],
  },
];

export const mockTrainForecasts: TrainForecast[] = [
  { trainNumber: 'G101', departureTime: new Date(now.getTime() + 30 * 60000), checkPoint: 'A1', forecastPassengers: 856, confidence: 0.92 },
  { trainNumber: 'G203', departureTime: new Date(now.getTime() + 45 * 60000), checkPoint: 'A2', forecastPassengers: 723, confidence: 0.88 },
  { trainNumber: 'D305', departureTime: new Date(now.getTime() + 20 * 60000), checkPoint: 'B1', forecastPassengers: 456, confidence: 0.95 },
  { trainNumber: 'G407', departureTime: new Date(now.getTime() + 60 * 60000), checkPoint: 'C1', forecastPassengers: 634, confidence: 0.85 },
  { trainNumber: 'G509', departureTime: new Date(now.getTime() + 90 * 60000), checkPoint: 'A1', forecastPassengers: 912, confidence: 0.78 },
  { trainNumber: 'D611', departureTime: new Date(now.getTime() + 75 * 60000), checkPoint: 'B2', forecastPassengers: 389, confidence: 0.90 },
];

export const mockDailyReport: DailyReport = {
  date: now,
  totalIn: 45678,
  totalOut: 42156,
  peakInHour: 9,
  peakInCount: 5234,
  events: 12,
  resolvedEvents: 10,
  equipmentFaults: 3,
  avgRepairTime: 25,
};

export const mockStationCompare: StationCompare[] = [
  { id: 'st1', name: '本站', inCount: 12580, outCount: 10234, inStation: 4521, saturation: 58, events: 3 },
  { id: 'st2', name: '北京南站', inCount: 18920, outCount: 16540, inStation: 6780, saturation: 68, events: 5 },
  { id: 'st3', name: '上海虹桥站', inCount: 17650, outCount: 15230, inStation: 5890, saturation: 62, events: 4 },
  { id: 'st4', name: '广州南站', inCount: 16230, outCount: 14560, inStation: 5340, saturation: 59, events: 2 },
];

export const mockPeakWarning: PeakWarning = {
  id: 'pw1',
  level: 'orange',
  message: '预计10:00-11:00将出现进站客流高峰',
  forecastTime: new Date(now.getTime() + 45 * 60000),
  forecastCount: 5200,
  suggestions: [
    '建议增开2个进站通道',
    '增加安检人员配置',
    '提前准备客流疏导广播',
  ],
};

export const mockHourlyFlow = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  inCount: Math.floor(2000 + Math.sin((i - 6) / 4) * 2000 + Math.random() * 500),
  outCount: Math.floor(1800 + Math.sin((i - 8) / 4) * 1800 + Math.random() * 400),
}));
