import * as React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground border-current',
  success:
    'border-transparent bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100/80 dark:hover:bg-green-900/50',
  warning:
    'border-transparent bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/50',
  info: 'border-transparent bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/50',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  secondary: 'bg-secondary-foreground',
  destructive: 'bg-destructive',
  outline: 'bg-foreground',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

function Badge({
  className,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotColor || dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export interface BadgeDotProps extends Omit<BadgeProps, 'dot'> {
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

function BadgeDot({ color = 'default', className, ...props }: BadgeDotProps) {
  const colorMap: Record<string, string> = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <Badge className={cn('px-2 py-1', className)} {...props}>
      <span className={cn('h-2 w-2 rounded-full', colorMap[color])} aria-hidden="true" />
      {props.children}
    </Badge>
  );
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'icon' | 'dot'> {
  status: 'active' | 'inactive' | 'pending' | 'blocked' | 'online' | 'offline';
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'secondary' },
    pending: { label: 'Pending', color: 'warning' },
    blocked: { label: 'Blocked', color: 'destructive' },
    online: { label: 'Online', color: 'success' },
    offline: { label: 'Offline', color: 'secondary' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      dot
      dotColor={
        status === 'active' || status === 'online'
          ? 'bg-green-500'
          : status === 'inactive' || status === 'offline'
            ? 'bg-gray-400'
            : status === 'pending'
              ? 'bg-yellow-500'
              : 'bg-red-500'
      }
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

export { Badge, BadgeDot, StatusBadge };
