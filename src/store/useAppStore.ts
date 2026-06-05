import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  ScheduledBroadcast,
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
  scheduledBroadcasts: ScheduledBroadcast[];
  staff: Staff[];
  events: Event[];
  trainForecasts: TrainForecast[];
  peakWarning: PeakWarning | null;
  selectedDate: Date;
  broadcastFilter: {
    search: string;
    status: string;
    area: string;
  };
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleCheckPoint: (id: string) => void;
  addBroadcastRecord: (record: Omit<BroadcastRecord, 'id' | 'playTime'>) => void;
  addEvent: (event: Omit<Event, 'id' | 'reportTime' | 'updates' | 'progress' | 'status'>) => void;
  updateEventProgress: (id: string, progress: number, status: Event['status'], update: string, operator: string) => void;
  addSpecialPassenger: (passenger: Omit<SpecialPassenger, 'id' | 'createTime' | 'status'>) => void;
  updateSpecialPassengerStatus: (id: string, status: SpecialPassenger['status']) => void;
  addScheduledBroadcast: (broadcast: Omit<ScheduledBroadcast, 'id' | 'createdAt' | 'status'>) => void;
  cancelScheduledBroadcast: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  refreshAnalysisData: () => void;
  setBroadcastFilter: (filter: Partial<AppState['broadcastFilter']>) => void;
  clearBroadcastFilter: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      scheduledBroadcasts: [],
      staff: mockStaff,
      events: mockEvents,
      trainForecasts: mockTrainForecasts,
      peakWarning: mockPeakWarning,
      selectedDate: new Date(),
      broadcastFilter: {
        search: '',
        status: 'all',
        area: 'all',
      },
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
      addScheduledBroadcast: (broadcast) => set((state) => ({
        scheduledBroadcasts: [
          { ...broadcast, id: `sb${Date.now()}`, createdAt: new Date(), status: 'pending' },
          ...state.scheduledBroadcasts,
        ],
      })),
      cancelScheduledBroadcast: (id) => set((state) => ({
        scheduledBroadcasts: state.scheduledBroadcasts.map((sb) =>
          sb.id === id ? { ...sb, status: 'cancelled' } : sb
        ),
      })),
      setSelectedDate: (date) => set({ selectedDate: date }),
      refreshAnalysisData: () => {
        const state = get();
        const baseVariation = Math.random() * 0.2 - 0.1;
        set({
          passengerFlow: {
            ...state.passengerFlow,
            inCount: Math.floor(state.passengerFlow.inCount * (1 + baseVariation)),
            outCount: Math.floor(state.passengerFlow.outCount * (1 + baseVariation)),
            inStation: Math.floor(state.passengerFlow.inStation * (1 + baseVariation)),
          },
        });
      },
      setBroadcastFilter: (filter) => set((state) => ({
        broadcastFilter: { ...state.broadcastFilter, ...filter },
      })),
      clearBroadcastFilter: () => set({
        broadcastFilter: { search: '', status: 'all', area: 'all' },
      }),
    }),
    {
      name: 'station-flow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        broadcastRecords: state.broadcastRecords,
        scheduledBroadcasts: state.scheduledBroadcasts,
        specialPassengers: state.specialPassengers,
        events: state.events,
        broadcastFilter: state.broadcastFilter,
        selectedDate: state.selectedDate.toISOString(),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.selectedDate && typeof state.selectedDate === 'string') {
            state.selectedDate = new Date(state.selectedDate);
          }
          state.broadcastRecords = state.broadcastRecords.map((r: any) => ({
            ...r,
            playTime: new Date(r.playTime),
          }));
          state.scheduledBroadcasts = state.scheduledBroadcasts.map((s: any) => ({
            ...s,
            scheduledTime: new Date(s.scheduledTime),
            createdAt: new Date(s.createdAt),
          }));
          state.specialPassengers = state.specialPassengers.map((p: any) => ({
            ...p,
            createTime: new Date(p.createTime),
          }));
          state.events = state.events.map((e: any) => ({
            ...e,
            reportTime: new Date(e.reportTime),
            updates: e.updates.map((u: any) => ({ ...u, timestamp: new Date(u.timestamp) })),
          }));
        }
      },
    }
  )
);
