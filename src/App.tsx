import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import GateMonitor from '@/pages/GateMonitor';
import WaitingArea from '@/pages/WaitingArea';
import Broadcast from '@/pages/Broadcast';
import StaffScheduling from '@/pages/StaffScheduling';
import EventLog from '@/pages/EventLog';
import Analysis from '@/pages/Analysis';
import { useAppStore } from '@/store/useAppStore';

export default function App() {
  const checkAndPlayScheduledBroadcasts = useAppStore((state) => state.checkAndPlayScheduledBroadcasts);

  useEffect(() => {
    checkAndPlayScheduledBroadcasts();
    const interval = setInterval(() => {
      checkAndPlayScheduledBroadcasts();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkAndPlayScheduledBroadcasts]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gate-monitor" element={<GateMonitor />} />
          <Route path="/waiting-area" element={<WaitingArea />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/staff-scheduling" element={<StaffScheduling />} />
          <Route path="/event-log" element={<EventLog />} />
          <Route path="/analysis" element={<Analysis />} />
        </Route>
      </Routes>
    </Router>
  );
}
