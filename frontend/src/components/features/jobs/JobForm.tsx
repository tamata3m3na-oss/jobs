'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { X, Plus } from 'lucide-react';

interface JobFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const JobForm = ({ initialData, onSubmit, isLoading }: JobFormProps) => {
  const [formData, setFormData] = React.useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    jobType: initialData?.jobType || 'FULL_TIME',
    experienceLevel: initialData?.experienceLevel || 'MID_LEVEL',
    location: {
      city: initialData?.location?.city || '',
      country: initialData?.location?.country || '',
      isRemote: initialData?.location?.isRemote ?? false,
    },
    salary: {
      min: initialData?.salary?.min || 0,
      max: initialData?.salary?.max || 0,
      currency: initialData?.salary?.currency || 'USD',
      period: initialData?.salary?.period || 'YEARLY',
    },
    skills: initialData?.skills || [],
    benefits: initialData?.benefits || [],
    matchSettings: {
      enableAiMatching: initialData?.matchSettings?.enableAiMatching ?? true,
      minMatchScore: initialData?.matchSettings?.minMatchScore ?? 60,
      blindHiring: initialData?.matchSettings?.blindHiring ?? false,
    },
  });

  const [newSkill, setNewSkill] = React.useState('');
  const [newBenefit, setNewBenefit] = React.useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s: string) => s !== skill) }));
  };

  const addBenefit = () => {
    if (newBenefit && !formData.benefits.includes(newBenefit)) {
      setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, newBenefit] }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b: string) => b !== benefit),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Job Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="ENTRY_LEVEL">Entry Level</option>
                <option value="MID_LEVEL">Mid Level</option>
                <option value="SENIOR_LEVEL">Senior Level</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded h-32"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & Compensation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="isRemote"
              name="location.isRemote"
              checked={formData.location.isRemote}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <label htmlFor="isRemote" className="text-sm font-medium">
              Remote Job
            </label>
          </div>

          {!formData.location.isRemote && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <input
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <input
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Salary</label>
              <input
                type="number"
                name="salary.min"
                value={formData.salary.min}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Salary</label>
              <input
                type="number"
                name="salary.max"
                value={formData.salary.max}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <input
                name="salary.currency"
                value={formData.salary.currency}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="USD"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 p-2 border rounded"
                placeholder="Add a skill"
              />
              <Button type="button" onClick={addSkill} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="pl-2">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Benefits</label>
            <div className="flex gap-2">
              <input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                className="flex-1 p-2 border rounded"
                placeholder="Add a benefit (e.g. Health Insurance)"
              />
              <Button type="button" onClick={addBenefit} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.benefits.map((benefit: string) => (
                <Badge key={benefit} variant="secondary" className="pl-2">
                  {benefit}
                  <button
                    onClick={() => removeBenefit(benefit)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
              <p className="text-sm text-muted-foreground">Enable AI-powered candidate matching.</p>
            </div>
            <input
              type="checkbox"
              name="matchSettings.enableAiMatching"
              checked={formData.matchSettings.enableAiMatching}
              onChange={handleCheckboxChange}
              className="h-6 w-6"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Blind Hiring Mode</label>
              <p className="text-sm text-muted-foreground">
                Hide candidate personal information until later stages.
              </p>
            </div>
            <input
              type="checkbox"
              name="matchSettings.blindHiring"
              checked={formData.matchSettings.blindHiring}
              onChange={handleCheckboxChange}
              className="h-6 w-6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Minimum Match Score ({formData.matchSettings.minMatchScore}%)
            </label>
            <input
              type="range"
              name="matchSettings.minMatchScore"
              min="0"
              max="100"
              value={formData.matchSettings.minMatchScore}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Job Posting'}
        </Button>
      </div>
    </form>
  );
};
