import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  showCount?: boolean;
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, autoResize = false, showCount = false, error, id, maxLength, value, ...props },
    ref
  ) => {
    const textareaId = id || React.useId();
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = React.useMemo(() => {
      if (ref) {
        if (typeof ref === 'function') {
          return (node: HTMLTextAreaElement | null) => {
            (ref as (node: HTMLTextAreaElement | null) => void)(node);
            (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          };
        }
        return (node: HTMLTextAreaElement | null) => {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        };
      }
      return internalRef;
    }, [ref]);

    const currentLength = typeof value === 'string' ? value.length : 0;

    React.useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize, value]);

    return (
      <div className="relative">
        <textarea
          id={textareaId}
          ref={combinedRef}
          value={value}
          maxLength={maxLength}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors',
            error && 'border-destructive focus-visible:ring-destructive',
            autoResize && 'resize-none overflow-hidden',
            className
          )}
          aria-invalid={error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {showCount && maxLength !== undefined && (
          <div
            className={cn(
              'absolute bottom-2 right-2 text-xs text-muted-foreground',
              currentLength >= maxLength && 'text-destructive font-medium'
            )}
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
