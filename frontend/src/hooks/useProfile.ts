'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: {
    city?: string;
    country?: string;
  };
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Language {
  language: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
}

export interface PreferredSalary {
  min: number;
  max: number;
  currency: string;
}

export interface JobSeekerProfile {
  headline?: string;
  summary?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  resumeUrl?: string;
  preferredJobTypes: string[];
  preferredLocations: {
    city?: string;
    country?: string;
  }[];
  preferredSalary?: PreferredSalary;
  preferredRadius: number;
  languages: Language[];
  availability: 'IMMEDIATELY' | 'ONE_WEEK' | 'TWO_WEEKS' | 'ONE_MONTH' | 'NOT_AVAILABLE';
  searchVisibility: boolean;
}

export interface ProfileCompletion {
  overall: number;
  sections: {
    personalInfo: number;
    resume: number;
    skills: number;
    experience: number;
    education: number;
    languages: number;
    preferences: number;
  };
  missingFields: string[];
}

export interface ProfileData extends JobSeekerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<ProfileData>(API_ENDPOINTS.USERS.PROFILE);
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    profile: data,
    isLoading,
    isError,
    error,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<JobSeekerProfile>) => {
      const response = await api.patch<ProfileData>(API_ENDPOINTS.USERS.PROFILE, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return data;
    },
  });
}

export function useUploadResume() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await api.post<{ url: string }>('/users/resume', formData);
      return response;
    },
  });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post<{ url: string }>(API_ENDPOINTS.USERS.AVATAR, formData);
      return response;
    },
  });
}

export function useProfileCompletion() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profileCompletion'],
    queryFn: async () => {
      const response = await api.get<ProfileCompletion>('/users/profile/completion');
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    completion: data,
    isLoading,
    isError,
  };
}

export function useAddExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experience: Omit<Experience, 'id'>) => {
      return api.post<Experience>('/users/experience', experience);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Experience> }) => {
      return api.patch<Experience>(`/users/experience/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/users/experience/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useAddEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (education: Omit<Education, 'id'>) => {
      return api.post<Education>('/users/education', education);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Education> }) => {
      return api.patch<Education>(`/users/education/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/users/education/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useAddLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (language: Language) => {
      return api.post<Language>('/users/languages', language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      language,
      proficiency,
    }: {
      language: string;
      proficiency: Language['proficiency'];
    }) => {
      return api.patch<Language>(`/users/languages/${language}`, { proficiency });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (language: string) => {
      return api.delete(`/users/languages/${language}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: JobSeekerProfile['availability']) => {
      return api.patch(API_ENDPOINTS.USERS.PROFILE, { availability });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateSearchVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchVisibility: boolean) => {
      return api.patch(API_ENDPOINTS.USERS.PROFILE, { searchVisibility });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export const AVAILABILITY_LABELS: Record<JobSeekerProfile['availability'], string> = {
  IMMEDIATELY: 'Immediately Available',
  ONE_WEEK: 'Within 1 Week',
  TWO_WEEKS: 'Within 2 Weeks',
  ONE_MONTH: 'Within 1 Month',
  NOT_AVAILABLE: 'Not Available',
};

export const PROFICIENCY_LABELS: Record<Language['proficiency'], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  NATIVE: 'Native',
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
  REMOTE: 'Remote',
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

export const SKILLS_CATEGORIES = [
  {
    name: 'Programming Languages',
    skills: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'Go',
      'Rust',
      'PHP',
      'Ruby',
      'Swift',
      'Kotlin',
    ],
  },
  {
    name: 'Frameworks & Libraries',
    skills: [
      'React',
      'Angular',
      'Vue.js',
      'Node.js',
      'Express',
      'Django',
      'Flask',
      'Spring Boot',
      'Next.js',
      'NestJS',
    ],
  },
  {
    name: 'Databases',
    skills: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'DynamoDB',
      'Cassandra',
      'SQLite',
    ],
  },
  {
    name: 'Cloud & DevOps',
    skills: [
      'AWS',
      'Azure',
      'Google Cloud',
      'Docker',
      'Kubernetes',
      'Terraform',
      'Jenkins',
      'CI/CD',
      'Linux',
    ],
  },
  {
    name: 'Data & AI',
    skills: [
      'Machine Learning',
      'Deep Learning',
      'Data Science',
      'TensorFlow',
      'PyTorch',
      'NLP',
      'Computer Vision',
    ],
  },
  {
    name: 'Design & Product',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Product Management', 'Agile', 'Scrum'],
  },
];
