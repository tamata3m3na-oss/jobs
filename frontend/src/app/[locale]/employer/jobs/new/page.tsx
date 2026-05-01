'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEmployerJobs } from '@/hooks/useEmployerJobs';
import { JobForm } from '@/components/features/jobs/JobForm';
import { useToast } from '@/components/ui/Toast';

export default function NewJobPage() {
  const router = useRouter();
  const { createJob, isCreating } = useEmployerJobs();
  const { addToast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      await createJob(data);
      addToast({
        title: 'Success',
        description: 'Job posted successfully!',
        variant: 'success',
      });
      router.push('/employer/jobs');
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to post job. Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-muted-foreground">Fill in the details to find your next great hire.</p>
      </div>

      <JobForm onSubmit={handleSubmit} isLoading={isCreating} />
    </div>
  );
}
