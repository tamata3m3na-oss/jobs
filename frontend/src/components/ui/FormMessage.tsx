import * as React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: boolean;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, variant = 'error', icon = true, ...props }, ref) => {
    const variants = {
      success: {
        container: 'text-green-600 dark:text-green-500',
        icon: CheckCircle,
      },
      warning: {
        container: 'text-yellow-600 dark:text-yellow-500',
        icon: AlertTriangle,
      },
      error: {
        container: 'text-destructive',
        icon: AlertCircle,
      },
      info: {
        container: 'text-blue-600 dark:text-blue-500',
        icon: Info,
      },
    };

    const { container, icon: IconComponent } = variants[variant];

    return (
      <p
        ref={ref}
        role={variant === 'error' ? 'alert' : undefined}
        aria-live={variant === 'error' ? 'polite' : undefined}
        className={cn(
          'text-sm font-medium animate-fade-in flex items-center gap-1.5',
          container,
          className
        )}
        {...props}
      >
        {icon && <IconComponent className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
        {children}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { FormMessage };
