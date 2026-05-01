import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, error, id, checked, onChange, ...props }, ref) => {
    const checkboxId = id || React.useId();

    // Use a mutable object to hold the input element reference
    const inputRefHolder = React.useMemo(() => ({ current: null as HTMLInputElement | null }), []);

    React.useEffect(() => {
      const el = inputRefHolder.current;
      if (el) {
        el.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate, inputRefHolder]);

    const handleRef = (node: HTMLInputElement | null) => {
      inputRefHolder.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        (ref as { current: HTMLInputElement | null }).current = node;
      }
    };

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="checkbox"
            id={checkboxId}
            ref={handleRef as unknown as React.Ref<HTMLInputElement>}
            checked={checked}
            onChange={onChange}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer',
              error && 'border-destructive',
              className
            )}
            aria-invalid={error || undefined}
            {...props}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {checked && !indeterminate && (
              <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
            )}
            {indeterminate && <div className="h-3 w-3 rounded-sm bg-primary" />}
          </div>
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps {
  options: Array<{ value: string; label: React.ReactNode; disabled?: boolean }>;
  value?: string[];
  onChange?: (value: string[]) => void;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
  className?: string;
  name?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    { className, options, value = [], onChange, orientation = 'vertical', error, children },
    ref
  ) => {
    const handleChange = (optionValue: string, checked: boolean) => {
      if (onChange) {
        if (checked) {
          onChange([...value, optionValue]);
        } else {
          onChange(value.filter((v) => v !== optionValue));
        }
      }
    };

    const isHorizontal = orientation === 'horizontal';

    return (
      <div
        ref={ref}
        className={cn('space-y-2', isHorizontal && 'flex flex-row flex-wrap gap-4', className)}
        role="group"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={option.disabled}
              error={!!error}
            />
            <label
              htmlFor={option.value}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer',
                option.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
        {children}
      </div>
    );
  }
);
CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, CheckboxGroup };
