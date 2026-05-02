'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useLogin } from '@/hooks/useAuth';
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
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Auth.login');
  const commonT = useTranslations('Common');
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginMutation.mutateAsync({ email, password });
      // Redirect is handled in AuthContext or the component itself after success
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'));
    }
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
          <FormField label={t('passwordLabel')} required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="h-4 w-4" />}
            />
          </FormField>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('rememberMe')}
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <span>{t('forgotPassword')}</span>
            </Link>
          </div>
          <Button type="submit" fullWidth isLoading={loginMutation.isPending}>
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
          <Button variant="outline" type="button" disabled={loginMutation.isPending}>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={loginMutation.isPending}>
            LinkedIn
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
        {t('dontHaveAccount')}{' '}
        <Link
          href="/register"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          <span>{t('registerLink')}</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
