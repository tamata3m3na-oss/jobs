'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForgotPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Link, useRouter } from '@/navigation';
import { Alert } from '@/components/ui/Alert';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.forgotPassword');
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await forgotPasswordMutation.mutateAsync(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-none shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('successMessage', { email })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="success">{t('instructions')}</Alert>
          <Button variant="outline" fullWidth type="button" onClick={() => router.push('/login')}>
            <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180 rtl:mr-0 rtl:ml-2" />
            {t('backToLogin')}
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          <FormField label={t('emailLabel')} required>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </FormField>
          <Button type="submit" fullWidth isLoading={forgotPasswordMutation.isPending}>
            {t('submit')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
        <Link
          href="/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180 rtl:mr-0 rtl:ml-2" />
          {t('backToLogin')}
        </Link>
      </CardFooter>
    </Card>
  );
}
