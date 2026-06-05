export interface PassengerFlow {
  id: string;
  timestamp: Date;
  inCount: number;
  outCount: number;
  inStation: number;
  areaDistribution: Record<string, number>;
}

export interface GateDevice {
  id: string;
  name: string;
  status: 'normal' | 'fault' | 'closed';
  passengerCount: number;
  queueLength: number;
  checkPointId: string;
}

export interface CheckPoint {
  id: string;
  name: string;
  status: 'open' | 'closed';
  gateCount: number;
  trainNumber?: string;
  departureTime?: Date;
}

export interface WaitingArea {
  id: string;
  name: string;
  capacity: number;
  current: number;
  saturation: number;
  heatmapData: number[][];
}

export type SpecialPassengerType = 'elderly' | 'disabled' | 'pregnant' | 'child' | 'other';
export type SpecialPassengerStatus = 'waiting' | 'boarding' | 'completed';

export interface SpecialPassenger {
  id: string;
  name: string;
  type: SpecialPassengerType;
  contact?: string;
  trainNumber: string;
  seatNumber?: string;
  status: SpecialPassengerStatus;
  notes?: string;
  createTime: Date;
}

export type BroadcastCategory = 'checkin' | 'delay' | 'notice' | 'paging' | 'emergency';

export interface BroadcastTemplate {
  id: string;
  name: string;
  category: BroadcastCategory;
  content: string;
}

export type BroadcastStatus = 'playing' | 'completed' | 'failed';

export interface BroadcastRecord {
  id: string;
  templateId?: string;
  content: string;
  area: string[];
  operator: string;
  playTime: Date;
  status: BroadcastStatus;
}

export type StaffStatus = 'on_duty' | 'off_duty' | 'rest';

export interface Staff {
  id: string;
  name: string;
  position: string;
  phone: string;
  status: StaffStatus;
  currentPost?: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface Schedule {
  id: string;
  staffId: string;
  date: Date;
  shift: ShiftType;
  post: string;
}

export interface PatrolRecord {
  id: string;
  staffId: string;
  checkpoint: string;
  timestamp: Date;
  location: { lat: number; lng: number };
}

export type EventType = 'congestion' | 'equipment' | 'passenger' | 'security' | 'other';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EventStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface EventUpdate {
  id: string;
  eventId: string;
  content: string;
  operator: string;
  timestamp: Date;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  severity: EventSeverity;
  location: string;
  description: string;
  reporter: string;
  reportTime: Date;
  handler?: string;
  status: EventStatus;
  progress: number;
  updates: EventUpdate[];
}

export interface TrainForecast {
  trainNumber: string;
  departureTime: Date;
  checkPoint: string;
  forecastPassengers: number;
  confidence: number;
}

export interface DailyReport {
  date: Date;
  totalIn: number;
  totalOut: number;
  peakInHour: number;
  peakInCount: number;
  events: number;
  resolvedEvents: number;
  equipmentFaults: number;
  avgRepairTime: number;
}

export interface StationCompare {
  id: string;
  name: string;
  inCount: number;
  outCount: number;
  inStation: number;
  saturation: number;
  events: number;
}

export interface PeakWarning {
  id: string;
  level: 'yellow' | 'orange' | 'red';
  message: string;
  forecastTime: Date;
  forecastCount: number;
  suggestions: string[];
}
