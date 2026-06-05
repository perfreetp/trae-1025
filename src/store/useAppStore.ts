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
  DailyReportData,
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
  mockDailyReport,
  mockHourlyFlow,
} from '@/mock';
import { format } from 'date-fns';

const generateDailyReportData = (dateKey: string): DailyReportData => {
  const baseDate = new Date(dateKey);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const variation = Math.max(0.5, 1 - diffDays * 0.02);
  const randomFactor = () => 0.9 + Math.random() * 0.2;

  return {
    dateKey,
    report: {
      date: baseDate,
      totalIn: Math.floor(mockDailyReport.totalIn * variation * randomFactor()),
      totalOut: Math.floor(mockDailyReport.totalOut * variation * randomFactor()),
      peakInHour: mockDailyReport.peakInHour,
      peakInCount: Math.floor(mockDailyReport.peakInCount * variation * randomFactor()),
      events: Math.max(1, Math.floor(mockDailyReport.events * variation * randomFactor())),
      resolvedEvents: Math.max(0, Math.floor(mockDailyReport.resolvedEvents * variation * randomFactor())),
      equipmentFaults: Math.max(0, Math.floor(mockDailyReport.equipmentFaults * variation * randomFactor())),
      avgRepairTime: mockDailyReport.avgRepairTime,
    },
    hourlyFlow: mockHourlyFlow.map((d) => ({
      hour: d.hour,
      inCount: Math.floor(d.inCount * variation * randomFactor()),
      outCount: Math.floor(d.outCount * variation * randomFactor()),
    })),
    generatedAt: new Date(),
  };
};

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
  dailyReports: Record<string, DailyReportData>;

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
  getOrCreateDailyReport: (dateKey: string) => DailyReportData;
  checkAndPlayScheduledBroadcasts: () => void;
  refreshDailyReport: (dateKey: string) => void;
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
      dailyReports: {},

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
      addScheduledBroadcast: (broadcast) => {
        const newBroadcast: ScheduledBroadcast = {
          ...broadcast,
          id: `sb${Date.now()}`,
          createdAt: new Date(),
          status: 'pending',
        };
        set((state) => ({
          scheduledBroadcasts: [newBroadcast, ...state.scheduledBroadcasts],
        }));
        setTimeout(() => get().checkAndPlayScheduledBroadcasts(), 100);
      },
      cancelScheduledBroadcast: (id) => set((state) => ({
        scheduledBroadcasts: state.scheduledBroadcasts.map((sb) =>
          sb.id === id ? { ...sb, status: 'cancelled' } : sb
        ),
      })),
      setSelectedDate: (date) => set({ selectedDate: date }),
      refreshAnalysisData: () => {
        const state = get();
        const dateKey = format(state.selectedDate, 'yyyy-MM-dd');
        const newReportData = generateDailyReportData(dateKey);
        set({
          dailyReports: {
            ...state.dailyReports,
            [dateKey]: newReportData,
          },
          passengerFlow: {
            ...state.passengerFlow,
            inCount: Math.floor(state.passengerFlow.inCount * (0.95 + Math.random() * 0.1)),
            outCount: Math.floor(state.passengerFlow.outCount * (0.95 + Math.random() * 0.1)),
            inStation: Math.floor(state.passengerFlow.inStation * (0.95 + Math.random() * 0.1)),
          },
        });
      },
      setBroadcastFilter: (filter) => set((state) => ({
        broadcastFilter: { ...state.broadcastFilter, ...filter },
      })),
      clearBroadcastFilter: () => set({
        broadcastFilter: { search: '', status: 'all', area: 'all' },
      }),
      getOrCreateDailyReport: (dateKey) => {
        const state = get();
        if (state.dailyReports[dateKey]) {
          return state.dailyReports[dateKey];
        }
        const newData = generateDailyReportData(dateKey);
        set({
          dailyReports: {
            ...state.dailyReports,
            [dateKey]: newData,
          },
        });
        return newData;
      },
      refreshDailyReport: (dateKey) => {
        const newData = generateDailyReportData(dateKey);
        set((state) => ({
          dailyReports: {
            ...state.dailyReports,
            [dateKey]: newData,
          },
        }));
      },
      checkAndPlayScheduledBroadcasts: () => {
        const state = get();
        const now = new Date();
        const updatedBroadcasts: ScheduledBroadcast[] = [];
        const newRecords: BroadcastRecord[] = [];

        state.scheduledBroadcasts.forEach((sb) => {
          if (sb.status === 'pending' && new Date(sb.scheduledTime) <= now) {
            updatedBroadcasts.push({ ...sb, status: 'played' });
            newRecords.push({
              id: `br${Date.now()}-${sb.id}`,
              templateId: sb.templateId,
              content: sb.content,
              area: sb.area,
              operator: sb.createdBy,
              playTime: new Date(sb.scheduledTime),
              status: 'completed',
            });
          } else {
            updatedBroadcasts.push(sb);
          }
        });

        if (newRecords.length > 0) {
          set({
            scheduledBroadcasts: updatedBroadcasts,
            broadcastRecords: [...newRecords, ...state.broadcastRecords],
          });
        }
      },
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
        dailyReports: state.dailyReports,
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
          if (state.dailyReports) {
            Object.keys(state.dailyReports).forEach((key) => {
              const report = state.dailyReports![key];
              report.report.date = new Date(report.report.date);
              report.generatedAt = new Date(report.generatedAt);
            });
          }
          setTimeout(() => {
            state.checkAndPlayScheduledBroadcasts();
          }, 500);
        }
      },
    }
  )
);
