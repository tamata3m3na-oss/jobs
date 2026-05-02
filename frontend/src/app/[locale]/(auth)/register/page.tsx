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

export default function RegisterPage() {
  const t = useTranslations('Auth.register');
  const router = useRouter();
  const registerMutation = useRegister();

  const [role, setRole] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER');
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
      setError("Passwords don't match");
      return;
    }

    if (!formData.terms) {
      setError('You must agree to the terms and conditions');
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
      setError(err.response?.data?.message || t('error'));
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
          <Button variant="outline" type="button" disabled={registerMutation.isPending}>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={registerMutation.isPending}>
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
