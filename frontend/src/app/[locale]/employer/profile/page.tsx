'use client';

import React from 'react';
import { useEmployerProfile } from '@/hooks/useEmployerProfile';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  Building,
  Globe,
  MapPin,
  Users,
  Plus,
  X,
  Linkedin,
  Twitter,
  Facebook,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function EmployerProfilePage() {
  const { profile, isLoading, updateProfile, isUpdating } = useEmployerProfile();
  const [formData, setFormData] = React.useState<any>(null);
  const { addToast } = useToast();

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading || !formData)
    return <div className="p-8 text-center">Loading company profile...</div>;

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
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      addToast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'error',
      });
    }
  };

  const addBenefit = () => {
    const benefit = prompt('Enter a company benefit:');
    if (benefit) {
      setFormData((prev: any) => ({
        ...prev,
        benefits: [...(prev.benefits || []), benefit],
      }));
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      benefits: prev.benefits.filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">
            Manage your company public information and branding.
          </p>
        </div>
        {profile?.isVerified && (
          <Badge variant="success" className="h-8 px-3 gap-1">
            <ShieldCheck className="h-4 w-4" /> Verified Company
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <input
                      name="industry"
                      value={formData.industry || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Size</label>
                    <select
                      name="companySize"
                      value={formData.companySize || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website URL</label>
                    <input
                      name="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded h-32"
                    placeholder="Tell candidates about your company..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Culture & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Culture & Values</label>
                  <textarea
                    name="culture"
                    value={formData.culture || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Our values include innovation, collaboration..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Employee Benefits</label>
                    <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                      <Plus className="mr-2 h-4 w-4" /> Add Benefit
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits?.map((benefit: string, index: number) => (
                      <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={formData.logoUrl} />
                  <AvatarFallback>
                    <Building className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Logo
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Recommended size: 400x400px. Max file size: 2MB.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </label>
                  <input
                    name="socialLinks.linkedin"
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="LinkedIn profile URL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter
                  </label>
                  <input
                    name="socialLinks.twitter"
                    value={formData.socialLinks?.twitter || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Twitter profile URL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm flex items-center gap-2">
                    <Facebook className="h-4 w-4" /> Facebook
                  </label>
                  <input
                    name="socialLinks.facebook"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Facebook profile URL"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
