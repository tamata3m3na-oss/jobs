'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth, useUpdateProfile, useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Trash2,
  Save,
  Mail,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon, children }: SettingsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}

function PasswordSection() {
  const t = useTranslations('Settings');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <SettingsSection
      title={t('changePassword')}
      description={t('changePasswordDescription')}
      icon={<Lock className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{t('currentPassword')}</label>
          <div className="relative">
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Key className="h-4 w-4" />}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t('newPassword')}</label>
          <Input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Key className="h-4 w-4" />}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t('confirmPassword')}</label>
          <Input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Key className="h-4 w-4" />}
            error={newPassword !== confirmPassword && confirmPassword.length > 0}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-sm text-primary hover:underline"
          >
            {showPasswords ? (
              <EyeOff className="h-4 w-4 inline mr-1" />
            ) : (
              <Eye className="h-4 w-4 inline mr-1" />
            )}
            {showPasswords ? t('hidePasswords') : t('showPasswords')}
          </button>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            {t('passwordUpdated')}
          </div>
        )}
        <Button
          type="submit"
          isLoading={isUpdating}
          disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
        >
          <Save className="h-4 w-4 mr-2" />
          {t('updatePassword')}
        </Button>
      </form>
    </SettingsSection>
  );
}

function EmailNotificationsSection() {
  const t = useTranslations('Settings');
  const [settings, setSettings] = useState({
    applicationUpdates: true,
    jobRecommendations: true,
    employerMessages: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  return (
    <SettingsSection
      title={t('emailNotifications')}
      description={t('emailNotificationsDescription')}
      icon={<Mail className="h-5 w-5" />}
    >
      <div className="space-y-0">
        <ToggleRow
          label={t('applicationUpdates')}
          description={t('applicationUpdatesDescription')}
          checked={settings.applicationUpdates}
          onChange={(checked) => setSettings({ ...settings, applicationUpdates: checked })}
        />
        <ToggleRow
          label={t('jobRecommendations')}
          description={t('jobRecommendationsDescription')}
          checked={settings.jobRecommendations}
          onChange={(checked) => setSettings({ ...settings, jobRecommendations: checked })}
        />
        <ToggleRow
          label={t('employerMessages')}
          description={t('employerMessagesDescription')}
          checked={settings.employerMessages}
          onChange={(checked) => setSettings({ ...settings, employerMessages: checked })}
        />
        <ToggleRow
          label={t('weeklyDigest')}
          description={t('weeklyDigestDescription')}
          checked={settings.weeklyDigest}
          onChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
        />
        <ToggleRow
          label={t('marketingEmails')}
          description={t('marketingEmailsDescription')}
          checked={settings.marketingEmails}
          onChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
        />
      </div>
    </SettingsSection>
  );
}

function PushNotificationsSection() {
  const t = useTranslations('Settings');
  const [settings, setSettings] = useState({
    newApplications: true,
    applicationStatus: true,
    messages: true,
    jobAlerts: false,
  });

  return (
    <SettingsSection
      title={t('pushNotifications')}
      description={t('pushNotificationsDescription')}
      icon={<Smartphone className="h-5 w-5" />}
    >
      <div className="space-y-0">
        <ToggleRow
          label={t('newApplications')}
          description={t('newApplicationsDescription')}
          checked={settings.newApplications}
          onChange={(checked) => setSettings({ ...settings, newApplications: checked })}
        />
        <ToggleRow
          label={t('applicationStatus')}
          description={t('applicationStatusDescription')}
          checked={settings.applicationStatus}
          onChange={(checked) => setSettings({ ...settings, applicationStatus: checked })}
        />
        <ToggleRow
          label={t('messages')}
          description={t('messagesDescription')}
          checked={settings.messages}
          onChange={(checked) => setSettings({ ...settings, messages: checked })}
        />
        <ToggleRow
          label={t('jobAlerts')}
          description={t('jobAlertsDescription')}
          checked={settings.jobAlerts}
          onChange={(checked) => setSettings({ ...settings, jobAlerts: checked })}
        />
      </div>
    </SettingsSection>
  );
}

function PrivacySection() {
  const t = useTranslations('Settings');
  const [settings, setSettings] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: false,
    allowAnalytics: true,
  });

  return (
    <SettingsSection
      title={t('privacySettings')}
      description={t('privacySettingsDescription')}
      icon={<Shield className="h-5 w-5" />}
    >
      <div className="space-y-0">
        <ToggleRow
          label={t('showProfile')}
          description={t('showProfileDescription')}
          checked={settings.showProfile}
          onChange={(checked) => setSettings({ ...settings, showProfile: checked })}
        />
        <ToggleRow
          label={t('showEmail')}
          description={t('showEmailDescription')}
          checked={settings.showEmail}
          onChange={(checked) => setSettings({ ...settings, showEmail: checked })}
        />
        <ToggleRow
          label={t('showPhone')}
          description={t('showPhoneDescription')}
          checked={settings.showPhone}
          onChange={(checked) => setSettings({ ...settings, showPhone: checked })}
        />
        <ToggleRow
          label={t('allowAnalytics')}
          description={t('allowAnalyticsDescription')}
          checked={settings.allowAnalytics}
          onChange={(checked) => setSettings({ ...settings, allowAnalytics: checked })}
        />
      </div>
    </SettingsSection>
  );
}

function DeleteAccountSection() {
  const t = useTranslations('Settings');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = () => {
    if (confirmText === 'DELETE') {
      // Handle account deletion
      console.log('Deleting account...');
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          {t('deleteAccount')}
        </CardTitle>
        <CardDescription>{t('deleteAccountWarning')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!showConfirm ? (
          <Button variant="destructive" onClick={() => setShowConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('deleteAccount')}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">{t('destructiveAction')}</p>
                  <p className="text-sm mt-1">{t('deleteAccountConfirmation')}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('typeDeleteToConfirm')}</label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE'}
              >
                {t('deleteAccount')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl">
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                {t('account')}
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                {t('security')}
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                {t('notifications')}
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                {t('privacy')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <SettingsSection
                title={t('accountInfo')}
                description={t('accountInfoDescription')}
                icon={<User className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Badge variant="secondary">{user?.role}</Badge>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                title={t('language')}
                description={t('languageDescription')}
                icon={<Globe className="h-5 w-5" />}
              >
                <div className="flex gap-3">
                  <Button variant="outline">English</Button>
                  <Button variant="default">العربية</Button>
                </div>
              </SettingsSection>
            </TabsContent>

            <TabsContent value="security">
              <PasswordSection />
            </TabsContent>

            <TabsContent value="notifications">
              <EmailNotificationsSection />
              <PushNotificationsSection />
            </TabsContent>

            <TabsContent value="privacy">
              <PrivacySection />
              <div className="mt-8">
                <DeleteAccountSection />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
