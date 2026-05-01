import { Metadata } from 'next';
import UsersClient from './UsersClient';

export const metadata: Metadata = {
  title: 'User Management | SmartJob',
  description: 'Manage system users and their permissions.',
};

export default function UsersPage() {
  return <UsersClient />;
}
