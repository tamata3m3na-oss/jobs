'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { FormField } from '@/components/ui/FormField';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Link } from '@/navigation';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { Mail, Lock, User, Building, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'JOB_SEEKER' | 'EMPLOYER';

export default function RegisterPage() {
  const t = useTranslations('Auth.register');
  const router = useRouter();
  const registerMutation = useRegister();

  const [role, setRole] = useState<UserRole>('JOB_SEEKER');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (!formData.terms) {
      setError(t('termsRequired'));
      return;
    }

    try {
      await registerMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role,
      });
    } catch (err: any) {
      setError(err.message || t('error'));
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    setError(null);
    setSocialLoading(provider);

    try {
      // For demo purposes, show an alert that OAuth would redirect
      // In production, this would redirect to the backend OAuth endpoint
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // Redirect to OAuth URL (would be: /api/v1/auth/oauth/${provider})
      const oauthUrl = `/api/v1/auth/oauth/${provider}?role=${role}`;
      
      // Open OAuth popup (for demo, using alert instead)
      console.log(`Initiating ${provider} OAuth flow with role: ${role}`);
      
      // Simulate OAuth flow for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, the OAuth callback would handle the response
      // and redirect back with auth tokens
      setError(`Social login with ${provider.charAt(0).toUpperCase() + provider.slice(1)} would redirect to: ${oauthUrl}`);
    } catch (err: any) {
      setError(err.message || `Failed to initiate ${provider} login`);
    } finally {
      setSocialLoading(null);
    }
  };

  const getStrengthVariant = () => {
    if (passwordStrength <= 25) return 'error';
    if (passwordStrength <= 50) return 'warning';
    if (passwordStrength <= 75) return 'default';
    return 'success';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 50) return t('passwordStrength.weak');
    if (passwordStrength <= 75) return t('passwordStrength.medium');
    return t('passwordStrength.strong');
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              onClick={() => setRole('JOB_SEEKER')}
              className={cn(
                'cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center transition-all',
                role === 'JOB_SEEKER'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              )}
            >
              <UserCircle
                className={cn(
                  'h-8 w-8 mb-2',
                  role === 'JOB_SEEKER' ? 'text-primary-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  role === 'JOB_SEEKER'
                    ? 'text-primary-900 dark:text-primary-100'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {t('roleJobSeeker')}
              </span>
            </div>
            <div
              onClick={() => setRole('EMPLOYER')}
              className={cn(
                'cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center transition-all',
                role === 'EMPLOYER'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              )}
            >
              <Building
                className={cn(
                  'h-8 w-8 mb-2',
                  role === 'EMPLOYER' ? 'text-primary-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  role === 'EMPLOYER'
                    ? 'text-primary-900 dark:text-primary-100'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {t('roleEmployer')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('firstNameLabel')} required>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                leftIcon={<User className="h-4 w-4" />}
              />
            </FormField>
            <FormField label={t('lastNameLabel')} required>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
            </FormField>
          </div>

          <FormField label={t('emailLabel')} required>
            <Input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </FormField>

          <FormField label={t('passwordLabel')} required>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              leftIcon={<Lock className="h-4 w-4" />}
            />
            {formData.password && (
              <div className="mt-2 space-y-1">
                <Progress value={passwordStrength} size="sm" variant={getStrengthVariant()} />
                <p className="text-xs text-muted-foreground">{getStrengthText()}</p>
              </div>
            )}
          </FormField>

          <FormField label={t('confirmPasswordLabel')} required>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              leftIcon={<Lock className="h-4 w-4" />}
            />
          </FormField>

          <div className="flex items-start space-x-2 rtl:space-x-reverse py-2">
            <Checkbox
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('termsLabel')}
            </Label>
          </div>

          <Button type="submit" fullWidth isLoading={registerMutation.isPending}>
            {t('submit')}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground font-medium">
              {t('socialLogin')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSocialLogin('google')}
            isLoading={socialLoading === 'google'}
            disabled={registerMutation.isPending}
            className="flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSocialLogin('linkedin')}
            isLoading={socialLoading === 'linkedin'}
            disabled={registerMutation.isPending}
            className="flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
        {t('alreadyHaveAccount')}{' '}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          <span>{t('loginLink')}</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
