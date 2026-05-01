'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useProfile,
  useUpdateProfile,
  useUploadResume,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useAddLanguage,
  useDeleteLanguage,
  useUpdateAvailability,
  useUpdateSearchVisibility,
  SKILLS_CATEGORIES,
  ProfileCompletion,
} from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, MultiSelect } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Languages,
  Upload,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';

const AVAILABILITY_OPTIONS = [
  { value: 'IMMEDIATELY', label: 'Immediately Available' },
  { value: 'ONE_WEEK', label: 'Within 1 Week' },
  { value: 'TWO_WEEKS', label: 'Within 2 Weeks' },
  { value: 'ONE_MONTH', label: 'Within 1 Month' },
  { value: 'NOT_AVAILABLE', label: 'Not Available' },
];

const PROFICIENCY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'NATIVE', label: 'Native' },
];

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'REMOTE', label: 'Remote' },
];

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, icon, action, children }: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ProfileCompletionCard({ completion }: { completion: ProfileCompletion }) {
  const t = useTranslations('Profile');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('profileCompletion')}</h3>
          <span className="text-2xl font-bold text-primary">{completion.overall}%</span>
        </div>
        <Progress value={completion.overall} className="mb-4" />

        <div className="space-y-2 text-sm">
          {Object.entries(completion.sections).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className={value === 100 ? 'text-green-500' : 'text-muted-foreground'}>
                {value}%
              </span>
            </div>
          ))}
        </div>

        {completion.missingFields.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">{t('missingFields')}</p>
            <div className="flex flex-wrap gap-1">
              {completion.missingFields.slice(0, 5).map((field) => (
                <Badge key={field} variant="outline" size="sm">
                  {field}
                </Badge>
              ))}
              {completion.missingFields.length > 5 && (
                <Badge variant="outline" size="sm">
                  +{completion.missingFields.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const { profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadResume = useUploadResume();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const handleEdit = () => {
    if (profile) {
      setEditData({
        headline: profile.headline || '',
        summary: profile.summary || '',
        preferredJobTypes: profile.preferredJobTypes || [],
        preferredSalary: profile.preferredSalary || { min: 0, max: 0, currency: 'USD' },
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadResume.mutateAsync(file);
      } catch (error) {
        console.error('Failed to upload resume:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton variant="text" width="40%" height={36} />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                {profile?.headline && <p className="text-muted-foreground">{profile.headline}</p>}
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                {t('editProfile')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0 space-y-6">
            <ProfileCompletionCard
              completion={{
                overall: profile?.resumeUrl ? 75 : 50,
                sections: {
                  personalInfo: profile?.firstName ? 100 : 0,
                  resume: profile?.resumeUrl ? 100 : 0,
                  skills: profile?.skills?.length ? 80 : 0,
                  experience: profile?.experience?.length ? 100 : 0,
                  education: profile?.education?.length ? 100 : 0,
                  languages: profile?.languages?.length ? 80 : 0,
                  preferences: 60,
                },
                missingFields: ['summary', 'preferredSalary'],
              }}
            />
          </div>

          <div className="flex-1 space-y-6">
            <SectionCard title={t('personalInfo')} icon={<User className="h-5 w-5" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t('firstName')}</label>
                  <p className="font-medium">{profile?.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('lastName')}</label>
                  <p className="font-medium">{profile?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('email')}</label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile?.email}
                  </p>
                </div>
                {profile?.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">{t('phone')}</label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </p>
                  </div>
                )}
              </div>
              {profile?.headline && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm text-muted-foreground">{t('headline')}</label>
                  <p className="font-medium">{profile.headline}</p>
                </div>
              )}
              {profile?.summary && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm text-muted-foreground">{t('summary')}</label>
                  <p className="text-sm mt-1">{profile.summary}</p>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title={t('resume')}
              icon={<FileText className="h-5 w-5" />}
              action={
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 text-sm font-medium">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('upload')}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                </label>
              }
            >
              {profile?.resumeUrl ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Resume.pdf</p>
                      <p className="text-sm text-muted-foreground">Uploaded</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('uploadResume')}</p>
                </div>
              )}
            </SectionCard>

            <SectionCard title={t('skills')} icon={<Briefcase className="h-5 w-5" />}>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noSkills')}</p>
              )}
            </SectionCard>

            <SectionCard
              title={t('experience')}
              icon={<Briefcase className="h-5 w-5" />}
              action={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('add')}
                </Button>
              }
            >
              {profile?.experience && profile.experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exp.startDate).toLocaleDateString()} -{' '}
                          {exp.current ? 'Present' : new Date(exp.endDate!).toLocaleDateString()}
                        </p>
                        {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noExperience')}</p>
              )}
            </SectionCard>

            <SectionCard
              title={t('education')}
              icon={<GraduationCap className="h-5 w-5" />}
              action={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('add')}
                </Button>
              }
            >
              {profile?.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.field} | {new Date(edu.startDate).toLocaleDateString()} -{' '}
                          {edu.current ? 'Present' : new Date(edu.endDate!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noEducation')}</p>
              )}
            </SectionCard>

            <SectionCard
              title={t('languages')}
              icon={<Languages className="h-5 w-5" />}
              action={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('add')}
                </Button>
              }
            >
              {profile?.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.languages.map((lang) => (
                    <div
                      key={lang.language}
                      className="flex items-center gap-2 p-2 border rounded-lg"
                    >
                      <span className="font-medium">{lang.language}</span>
                      <Badge variant="outline" size="sm">
                        {lang.proficiency}
                      </Badge>
                      <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noLanguages')}</p>
              )}
            </SectionCard>

            <SectionCard title={t('preferences')} icon={<Briefcase className="h-5 w-5" />}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t('preferredJobTypes')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferredJobTypes?.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type.replace('_', ' ')}
                      </Badge>
                    )) || <p className="text-muted-foreground">{t('notSet')}</p>}
                  </div>
                </div>

                {profile?.preferredSalary && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {t('preferredSalary')}
                    </label>
                    <p className="font-medium">
                      {profile.preferredSalary.currency}{' '}
                      {profile.preferredSalary.min.toLocaleString()} -{' '}
                      {profile.preferredSalary.max.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-medium">{t('availability')}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.availability?.replace('_', ' ') || t('notSet')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-3">
                    {profile?.searchVisibility ? (
                      <Eye className="h-5 w-5 text-green-500" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{t('searchVisibility')}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.searchVisibility
                          ? t('visibleToEmployers')
                          : t('hiddenFromEmployers')}
                      </p>
                    </div>
                  </div>
                  <Switch checked={profile?.searchVisibility || false} />
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
