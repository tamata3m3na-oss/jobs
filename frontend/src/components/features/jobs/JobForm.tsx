'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateJobSchema, CreateJob, UpdateJob } from '@smartjob/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const JobForm = ({ initialData, onSubmit }: { initialData?: Partial<CreateJob>, onSubmit: (data: CreateJob) => void }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateJob>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: initialData || {
      matchSettings: {
        enableAiMatching: true,
        minMatchScore: 60,
        blindHiring: false,
      }
    }
  });

  const blindHiring = watch('matchSettings.blindHiring');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Job Title</label>
            <input 
              {...register('title')} 
              className="w-full p-2 border rounded"
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea 
              {...register('description')} 
              className="w-full p-2 border rounded h-32"
            />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI & Matching Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Blind Hiring Mode</label>
              <p className="text-sm text-gray-500">Hide candidate personal information (name, photo) until later stages.</p>
            </div>
            <input 
              type="checkbox"
              checked={blindHiring}
              onChange={(e) => setValue('matchSettings.blindHiring', e.target.checked)}
              className="h-6 w-6"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Minimum Match Score ({watch('matchSettings.minMatchScore')}%)</label>
            <input 
              type="range"
              {...register('matchSettings.minMatchScore', { valueAsNumber: true })}
              min="0"
              max="100"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">Save Job Posting</Button>
    </form>
  );
};
