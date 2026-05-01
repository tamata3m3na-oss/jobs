import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SmartJob',
  description: 'System overview and statistics.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
