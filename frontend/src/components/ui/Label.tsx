import * as React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  description?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, description, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          htmlFor={props.htmlFor}
          id={id}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            className
          )}
          {...props}
        >
          {children}
          {required && (
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    );
  }
);
Label.displayName = 'Label';

export { Label };
