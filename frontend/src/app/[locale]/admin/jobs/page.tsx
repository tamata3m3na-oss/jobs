import { Metadata } from 'next';
import JobsClient from './JobsClient';

export const metadata: Metadata = {
  title: 'Job Moderation | SmartJob',
  description: 'Approve or reject job postings from employers.',
};

export default function JobsPage() {
  return <JobsClient />;
}
