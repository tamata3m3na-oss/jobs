import * as React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  icon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  title?: React.ReactNode;
}

const variantConfig: Record<AlertVariant, { container: string; icon: React.ElementType }> = {
  success: {
    container: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    icon: CheckCircle,
  },
  error: {
    container: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    icon: AlertCircle,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    icon: Info,
  },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant = 'info',
    icon = true,
    dismissible = false,
    onDismiss,
    title,
    children,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const { container, icon: Icon } = variantConfig[variant];

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false);
      onDismiss?.();
    }, [onDismiss]);

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          'relative flex w-full items-start gap-3 rounded-lg border p-4 transition-all duration-200',
          container,
          className
        )}
        {...props}
      >
        {icon && (
          <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="text-sm font-semibold mb-1">
              {title}
            </h5>
          )}
          {children && (
            <div className="text-sm opacity-90 [&>p]:m-0">
              {children}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };
