import * as React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
}

interface ToasterContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  promise?: <T>(
    promise: Promise<T>,
    callbacks: {
      loading: React.ReactNode;
      success: React.ReactNode | ((data: T) => React.ReactNode);
      error: React.ReactNode | ((error: Error) => React.ReactNode);
    },
    config?: { duration?: number }
  ) => void;
}

const ToasterContext = React.createContext<ToasterContextValue | undefined>(undefined);

export function useToaster() {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
}

const variantStyles: Record<ToastVariant, { container: string; icon: React.ElementType }> = {
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

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  id: string;
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onDismiss?: (id: string) => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, variant = 'info', title, description, duration = 5000, onDismiss, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [progress, setProgress] = React.useState(100);
    const { container, icon: Icon } = variantStyles[variant];
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = React.useRef<number>(Date.now());
    const remainingTimeRef = React.useRef(duration);

    React.useEffect(() => {
      if (duration === Infinity || duration <= 0) return;

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percent = (remaining / duration) * 100;
        setProgress(percent);

        if (remaining <= 0) {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(id), 200);
        }
      };

      intervalRef.current = setInterval(updateProgress, 50);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [duration, id, onDismiss]);

    const handleDismiss = React.useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (duration !== Infinity && duration > 0) {
        remainingTimeRef.current = (progress / 100) * duration;
      }
      setIsVisible(false);
      setTimeout(() => onDismiss?.(id), 200);
    }, [duration, id, onDismiss, progress]);

    const handlePause = React.useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, []);

    const handleResume = React.useCallback(() => {
      if (intervalRef.current || duration === Infinity || duration <= 0) return;
      startTimeRef.current = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percent = (remaining / duration) * 100;
        setProgress(percent);

        if (remaining <= 0) {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(id), 200);
        }
      };
      intervalRef.current = setInterval(updateProgress, 50);
    }, [duration, id, onDismiss]);

    return (
      <div
        ref={ref}
        role="region"
        aria-label={`Notification: ${typeof title === 'string' ? title : variant}`}
        className={cn(
          'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200',
          isVisible ? 'animate-fade-in' : 'opacity-0 translate-y-2',
          container,
          className
        )}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-semibold">{title}</p>}
          {description && <p className={cn('text-sm mt-1 opacity-90', title && 'mt-1')}>{description}</p>}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {duration !== Infinity && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 rounded-b-lg overflow-hidden">
            <div
              className={cn('h-full transition-all duration-100 ease-linear', {
                'bg-green-500': variant === 'success',
                'bg-red-500': variant === 'error',
                'bg-yellow-500': variant === 'warning',
                'bg-blue-500': variant === 'info',
              })}
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

interface ToasterProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToasterProvider({ children, position = 'top-right', maxToasts = 5 }: ToasterProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => {
      const newToasts = [{ ...toast, id }, ...prev];
      return newToasts.slice(0, maxToasts);
    });
    return id;
  }, [maxToasts]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const promise = React.useCallback(<T,>(
    promiseValue: Promise<T>,
    callbacks: {
      loading: React.ReactNode;
      success: React.ReactNode | ((data: T) => React.ReactNode);
      error: React.ReactNode | ((error: Error) => React.ReactNode);
    },
    config?: { duration?: number }
  ) => {
    const loadingId = addToast({ variant: 'info', title: callbacks.loading, duration: Infinity });
    promiseValue
      .then((data) => {
        removeToast(loadingId);
        const successMessage = typeof callbacks.success === 'function' ? callbacks.success(data) : callbacks.success;
        addToast({ variant: 'success', title: successMessage, duration: config?.duration });
      })
      .catch((error) => {
        removeToast(loadingId);
        const errorMessage = typeof callbacks.error === 'function' ? callbacks.error(error) : callbacks.error;
        addToast({ variant: 'error', title: errorMessage, duration: config?.duration });
      });
  }, [addToast, removeToast]);

  const contextValue = React.useMemo(() => ({ toasts, addToast, removeToast, promise }), [toasts, addToast, removeToast, promise]);

  return (
    <ToasterContext.Provider value={contextValue}>
      {children}
      <div role="region" aria-label="Notifications" className={cn('fixed z-50 flex flex-col gap-2 pointer-events-none', positionClasses[position])}>
        {toasts.map((toast) => (
          <Toast key={toast.id} id={toast.id} variant={toast.variant} title={toast.title} description={toast.description} duration={toast.duration} onDismiss={removeToast} className="pointer-events-auto" />
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export interface ToasterStandaloneProps {
  position?: ToastPosition;
}

export function ToasterStandalone({ position = 'top-right' }: ToasterStandaloneProps) {
  const { toasts, removeToast } = useToaster();

  return (
    <div role="region" aria-label="Notifications" className={cn('fixed z-50 flex flex-col gap-2 pointer-events-none', positionClasses[position])}>
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} variant={toast.variant} title={toast.title} description={toast.description} duration={toast.duration} onDismiss={removeToast} className="pointer-events-auto" />
      ))}
    </div>
  );
}
