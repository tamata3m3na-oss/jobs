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
    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray[0];
    const restChildren = childrenArray.slice(1);

    const childId =
      id || (React.isValidElement(firstChild) ? (firstChild.props as { id?: string }).id : undefined);
    const errorId = childId ? `${childId}-error` : undefined;
    const helperId = childId ? `${childId}-helper` : undefined;

    const describedBy =
      [error ? errorId : '', showHelperText && helperText ? helperId : '']
        .filter(Boolean)
        .join(' ') || undefined;

    const childWithAria = React.isValidElement(firstChild)
      ? React.cloneElement(firstChild as React.ReactElement, {
          id: childId,
          'aria-describedby': describedBy,
          'aria-invalid': error ? 'true' : undefined,
        } as React.HTMLAttributes<HTMLElement>)
      : firstChild;

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <Label htmlFor={childId} required={required} description={description}>
            {label}
          </Label>
        )}
        {childWithAria}
        {restChildren}
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
