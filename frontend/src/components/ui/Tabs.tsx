import * as React from 'react';
import { cn } from '../../lib/utils';

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'underline' | 'pill' | 'enclosed';
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'underline' | 'pill' | 'enclosed';
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { defaultValue, value, onValueChange, variant = 'underline', className, children, ...props },
    ref
  ) => {
    const [activeTab, setActiveTabState] = React.useState(value || defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTabState(value);
      }
    }, [value]);

    const setActiveTab = React.useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setActiveTabState(newValue);
        }
        onValueChange?.(newValue);
      },
      [value, onValueChange]
    );

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { variant } = useTabs();

    const variantClasses = {
      underline: 'border-b border-border space-x-8 rtl:space-x-reverse',
      pill: 'p-1 bg-muted rounded-lg space-x-1 rtl:space-x-reverse',
      enclosed: 'flex-wrap border-b border-border',
    };

    return (
      <div
        ref={ref}
        role="tablist"
        className={cn('inline-flex items-center w-full', variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled, className, children, ...props }, ref) => {
    const { activeTab, setActiveTab, variant } = useTabs();
    const isActive = activeTab === value;

    const variantClasses = {
      underline: cn(
        'pb-4 px-1 text-sm font-medium transition-all relative border-b-2 border-transparent',
        isActive ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground'
      ),
      pill: cn(
        'px-3 py-1.5 text-sm font-medium transition-all rounded-md',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ),
      enclosed: cn(
        'px-4 py-2 text-sm font-medium transition-all border border-transparent border-b-border -mb-[1px]',
        isActive
          ? 'bg-background text-foreground border-border border-b-transparent rounded-t-lg'
          : 'text-muted-foreground hover:text-foreground'
      ),
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
        disabled={disabled}
        onClick={() => setActiveTab(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { activeTab } = useTabs();
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        tabIndex={0}
        className={cn('mt-4 focus-visible:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
