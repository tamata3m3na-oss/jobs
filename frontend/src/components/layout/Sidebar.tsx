'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { cn } from '../../lib/utils';
import {
  ChevronLeft,
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  LucideIcon,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  roles?: string[];
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({ items, user, collapsed, onToggleCollapse, className }: SidebarProps) {
  const t = useTranslations('Navigation');
  const commonT = useTranslations('Common');
  const pathname = usePathname();

  const filteredItems = items.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-e transition-all duration-300 h-full',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="font-bold text-xl text-primary truncate">
            {commonT('title')}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(collapsed ? 'mx-auto' : 'ms-auto')}
        >
          {collapsed ? <ChevronLeft className="rotate-180" /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar src={user.avatar} alt={user.name} size="sm" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              className="w-full justify-start mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="me-2 h-4 w-4" />
              {t('logout')}
            </Button>
          )}
        </div>
      )}
    </aside>
  );
}

function SidebarItem({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed?: boolean;
  active?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (collapsed) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center justify-center h-10 w-10 rounded-md mx-auto transition-colors',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
        title={item.title}
      >
        <span>{item.icon && <item.icon size={20} />}</span>
      </Link>
    );
  }

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className="flex items-center gap-3 flex-1">
          {item.icon && <item.icon size={18} />}
          <span className="flex-1">{item.title}</span>
          {hasChildren && (
            <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
          )}
        </span>
      </Link>
      {hasChildren && isOpen && (
        <div className="mt-1 ms-9 space-y-1">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
