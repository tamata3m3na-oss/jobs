import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import {
  Search,
  FileX,
  Inbox,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export type EmptyStateVariant = 'no-results' | 'no-data' | 'error' | 'loading';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  actionAlign?: 'left' | 'center' | 'right';
}

const variantConfig: Record<EmptyStateVariant, { icon: React.ElementType; iconClass: string }> = {
  'no-results': {
    icon: Search,
    iconClass: 'text-muted-foreground',
  },
  'no-data': {
    icon: Inbox,
    iconClass: 'text-muted-foreground',
  },
  error: {
    icon: AlertTriangle,
    iconClass: 'text-destructive',
  },
  loading: {
    icon: RefreshCw,
    iconClass: 'text-muted-foreground animate-spin',
  },
};

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const actionAlignmentClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    variant = 'no-data',
    icon,
    title,
    description,
    action,
    actionAlign = 'center',
    className,
    ...props
  }, ref) => {
    const { icon: IconComponent, iconClass } = variantConfig[variant];
    const defaultIcon = <IconComponent className={cn('h-12 w-12', iconClass)} aria-hidden="true" />;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-4 py-12 px-4',
          alignmentClasses[actionAlign],
          className
        )}
        role="status"
        {...props}
      >
        <div className="flex-shrink-0">
          {icon || defaultIcon}
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className={cn('flex mt-2', actionAlignmentClasses[actionAlign])}>
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export interface EmptyStateNoResultsProps extends Omit<EmptyStateProps, 'variant' | 'title' | 'icon'> {
  searchQuery?: string;
}

function EmptyStateNoResults({
  searchQuery,
  ...props
}: EmptyStateNoResultsProps) {
  return (
    <EmptyState
      variant="no-results"
      title={searchQuery ? `No results for "${searchQuery}"` : 'No results found'}
      description={searchQuery
        ? 'Try adjusting your search or filters to find what you\'re looking for.'
        : 'There are no items to display at this time.'}
      icon={<Search className="h-12 w-12 text-muted-foreground" aria-hidden="true" />}
      {...props}
    />
  );
}

export interface EmptyStateNoDataProps extends Omit<EmptyStateProps, 'variant' | 'title' | 'icon'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

function EmptyStateNoData({
  title = 'No data available',
  description = 'There is no data to display at this time.',
  ...props
}: EmptyStateNoDataProps) {
  return (
    <EmptyState
      variant="no-data"
      title={title}
      description={description}
      icon={<Inbox className="h-12 w-12 text-muted-foreground" aria-hidden="true" />}
      {...props}
    />
  );
}

export interface EmptyStateErrorProps extends Omit<EmptyStateProps, 'variant' | 'title' | 'icon'> {
  error?: Error | string;
  onRetry?: () => void;
}

function EmptyStateError({
  error,
  onRetry,
  ...props
}: EmptyStateErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description={errorMessage || 'An error occurred while loading the data.'}
      icon={<AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />}
      action={onRetry ? { label: 'Try again', onClick: onRetry, variant: 'outline' } : undefined}
      {...props}
    />
  );
}

export { EmptyState, EmptyStateNoResults, EmptyStateNoData, EmptyStateError };
