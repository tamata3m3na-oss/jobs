'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function AdminSettingsPage() {
  const t = useTranslations('admin.settings');
  const common = useTranslations('Common');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">{t('systemConfig')}</TabsTrigger>
          <TabsTrigger value="moderation">{t('moderationRules')}</TabsTrigger>
          <TabsTrigger value="email">{t('emailTemplates')}</TabsTrigger>
          <TabsTrigger value="features">{t('featureFlags')}</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="SmartJob Platform" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" defaultValue="support@smartjob.com" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                </div>
                <Switch />
              </div>
              <Button>{common('save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Rules</CardTitle>
              <CardDescription>Configure how jobs and users are moderated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Jobs</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve jobs from verified employers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Flag Suspicious Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Use AI to flag suspicious job postings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>{common('save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would have similar content */}
      </Tabs>
    </div>
  );
}
