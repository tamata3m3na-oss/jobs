'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface JobFormProps {
  initialData?: {
    title?: string;
    description?: string;
    matchSettings?: {
      enableAiMatching?: boolean;
      minMatchScore?: number;
      blindHiring?: boolean;
    };
  };
  onSubmit: (data: {
    title: string;
    description: string;
    matchSettings: { enableAiMatching: boolean; minMatchScore: number; blindHiring: boolean };
  }) => void;
}

export const JobForm = ({ initialData, onSubmit }: JobFormProps) => {
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [enableAiMatching, setEnableAiMatching] = React.useState(
    initialData?.matchSettings?.enableAiMatching ?? true
  );
  const [minMatchScore, setMinMatchScore] = React.useState(
    initialData?.matchSettings?.minMatchScore ?? 60
  );
  const [blindHiring, setBlindHiring] = React.useState(
    initialData?.matchSettings?.blindHiring ?? false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      matchSettings: {
        enableAiMatching,
        minMatchScore,
        blindHiring,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded h-32"
              required
            />
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
              <label className="font-medium">AI Matching</label>
              <p className="text-sm text-gray-500">Enable AI-powered candidate matching.</p>
            </div>
            <input
              type="checkbox"
              checked={enableAiMatching}
              onChange={(e) => setEnableAiMatching(e.target.checked)}
              className="h-6 w-6"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Blind Hiring Mode</label>
              <p className="text-sm text-gray-500">
                Hide candidate personal information until later stages.
              </p>
            </div>
            <input
              type="checkbox"
              checked={blindHiring}
              onChange={(e) => setBlindHiring(e.target.checked)}
              className="h-6 w-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Minimum Match Score ({minMatchScore}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Save Job Posting
      </Button>
    </form>
  );
};
