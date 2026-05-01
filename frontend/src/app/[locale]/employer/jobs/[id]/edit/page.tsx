'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEmployerJobs, useEmployerJob } from '@/hooks/useEmployerJobs';
import { JobForm } from '@/components/features/jobs/JobForm';
import { useToast } from '@/components/ui/Toast';

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const { job, isLoading: isJobLoading } = useEmployerJob(id as string);
  const { updateJob, isUpdating } = useEmployerJobs();
  const { addToast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      await updateJob({ id: id as string, data });
      addToast({
        title: 'Success',
        description: 'Job updated successfully!',
        variant: 'success',
      });
      router.push('/employer/jobs');
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update job. Please try again.',
        variant: 'error',
      });
    }
  };

  if (isJobLoading) {
    return <div className="p-8 text-center">Loading job details...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center">Job not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job Posting</h1>
        <p className="text-muted-foreground">Update your job details and settings.</p>
      </div>

      <JobForm initialData={job} onSubmit={handleSubmit} isLoading={isUpdating} />
    </div>
  );
}
