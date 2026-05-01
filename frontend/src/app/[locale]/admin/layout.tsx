import { Metadata } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | SmartJob',
  description: 'Manage users, jobs, and system settings.',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
