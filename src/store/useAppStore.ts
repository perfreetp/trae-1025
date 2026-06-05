import { create } from 'zustand';
import type {
  PassengerFlow,
  GateDevice,
  CheckPoint,
  WaitingArea,
  SpecialPassenger,
  BroadcastTemplate,
  BroadcastRecord,
  Staff,
  Event,
  TrainForecast,
  PeakWarning,
} from '@/types';
import {
  mockPassengerFlow,
  mockGateDevices,
  mockCheckPoints,
  mockWaitingAreas,
  mockSpecialPassengers,
  mockBroadcastTemplates,
  mockBroadcastRecords,
  mockStaff,
  mockEvents,
  mockTrainForecasts,
  mockPeakWarning,
} from '@/mock';

interface AppState {
  currentUser: {
    id: string;
    name: string;
    role: string;
  } | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  passengerFlow: PassengerFlow;
  gateDevices: GateDevice[];
  checkPoints: CheckPoint[];
  waitingAreas: WaitingArea[];
  specialPassengers: SpecialPassenger[];
  broadcastTemplates: BroadcastTemplate[];
  broadcastRecords: BroadcastRecord[];
  staff: Staff[];
  events: Event[];
  trainForecasts: TrainForecast[];
  peakWarning: PeakWarning | null;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleCheckPoint: (id: string) => void;
  addBroadcastRecord: (record: Omit<BroadcastRecord, 'id' | 'playTime'>) => void;
  addEvent: (event: Omit<Event, 'id' | 'reportTime' | 'updates' | 'progress' | 'status'>) => void;
  updateEventProgress: (id: string, progress: number, status: Event['status'], update: string, operator: string) => void;
  addSpecialPassenger: (passenger: Omit<SpecialPassenger, 'id' | 'createTime' | 'status'>) => void;
  updateSpecialPassengerStatus: (id: string, status: SpecialPassenger['status']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: {
    id: '1',
    name: '张伟',
    role: '值班站长',
  },
  sidebarCollapsed: false,
  theme: 'light',
  passengerFlow: mockPassengerFlow,
  gateDevices: mockGateDevices,
  checkPoints: mockCheckPoints,
  waitingAreas: mockWaitingAreas,
  specialPassengers: mockSpecialPassengers,
  broadcastTemplates: mockBroadcastTemplates,
  broadcastRecords: mockBroadcastRecords,
  staff: mockStaff,
  events: mockEvents,
  trainForecasts: mockTrainForecasts,
  peakWarning: mockPeakWarning,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  toggleCheckPoint: (id) => set((state) => ({
    checkPoints: state.checkPoints.map((cp) =>
      cp.id === id ? { ...cp, status: cp.status === 'open' ? 'closed' : 'open' } : cp
    ),
  })),
  addBroadcastRecord: (record) => set((state) => ({
    broadcastRecords: [
      { ...record, id: `br${Date.now()}`, playTime: new Date() },
      ...state.broadcastRecords,
    ],
  })),
  addEvent: (event) => set((state) => ({
    events: [
      { ...event, id: `e${Date.now()}`, reportTime: new Date(), progress: 0, status: 'pending', updates: [] },
      ...state.events,
    ],
  })),
  updateEventProgress: (id, progress, status, update, operator) => set((state) => ({
    events: state.events.map((e) =>
      e.id === id
        ? {
            ...e,
            progress,
            status,
            updates: [
              ...e.updates,
              { id: `eu${Date.now()}`, eventId: id, content: update, operator, timestamp: new Date() },
            ],
          }
        : e
    ),
  })),
  addSpecialPassenger: (passenger) => set((state) => ({
    specialPassengers: [
      { ...passenger, id: `sp${Date.now()}`, createTime: new Date(), status: 'waiting' },
      ...state.specialPassengers,
    ],
  })),
  updateSpecialPassengerStatus: (id, status) => set((state) => ({
    specialPassengers: state.specialPassengers.map((p) =>
      p.id === id ? { ...p, status } : p
    ),
  })),
}));
