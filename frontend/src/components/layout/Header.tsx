'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '../../lib/utils';
import { Search, Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/DropdownMenu';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  onMenuClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

export function Header({ onMenuClick, user, className }: HeaderProps) {
  const t = useTranslations('Navigation');
  const commonT = useTranslations('Common');

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t('toggleMenu')}</span>
          </Button>

          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={commonT('searchPlaceholder')}
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">{t('notifications')}</span>
          </Button>

          <DropdownMenu
            align="right"
            trigger={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar src={user?.avatar} alt={user?.name} size="sm" />
              </Button>
            }
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || commonT('user')}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<User className="mr-2 h-4 w-4" />}>
              {t('profile')}
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Settings className="mr-2 h-4 w-4" />}>
              {t('settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" icon={<LogOut className="mr-2 h-4 w-4" />}>
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
