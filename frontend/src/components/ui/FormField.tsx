import * as React from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';
import { FormMessage } from './FormMessage';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showHelperText?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      children,
      label,
      description,
      error,
      helperText,
      required,
      showHelperText = true,
      id,
      ...props
    },
    ref
  ) => {
    const child = React.Children.only(children);
    const childId =
      id || (React.isValidElement(child) ? (child.props as { id?: string }).id : undefined);
    const errorId = childId ? `${childId}-error` : undefined;
    const helperId = childId ? `${childId}-helper` : undefined;

    const describedBy =
      [error ? errorId : '', showHelperText && helperText ? helperId : '']
        .filter(Boolean)
        .join(' ') || undefined;

    const childWithAria = React.isValidElement(child)
      ? React.cloneElement(child, {
          id: childId,
          'aria-describedby': describedBy,
          'aria-invalid': error ? 'true' : undefined,
        } as React.HTMLAttributes<HTMLElement>)
      : child;

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <Label htmlFor={childId} required={required} description={description}>
            {label}
          </Label>
        )}
        {childWithAria}
        {error && (
          <FormMessage variant="error" id={errorId}>
            {error}
          </FormMessage>
        )}
        {showHelperText && helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
