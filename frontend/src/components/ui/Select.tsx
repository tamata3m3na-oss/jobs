import * as React from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      disabled,
      error,
      className,
      id,
      name,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    const selectId = id || React.useId();
    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [options, searchQuery]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) {
        setSearchQuery('');
        setHighlightedIndex(0);
      }
    }, [isOpen]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen) {
            const option = filteredOptions[highlightedIndex];
            if (option && !option.disabled) {
              onChange?.(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };

    const handleOptionClick = (option: SelectOption) => {
      if (!option.disabled) {
        onChange?.(option.value);
        setIsOpen(false);
      }
    };

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <button
          type="button"
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={ariaLabel ? undefined : selectId}
          aria-label={ariaLabel}
          aria-invalid={error}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-destructive focus:ring-destructive',
            isOpen && 'ring-2 ring-ring ring-offset-2'
          )}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 opacity-50 transition-transform',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 animate-fade-in">
            <div className="relative rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                  role="combobox"
                  aria-expanded={isOpen}
                  aria-autocomplete="list"
                  aria-controls={`${selectId}-listbox`}
                />
              </div>
              <ul
                ref={listRef}
                id={`${selectId}-listbox`}
                role="listbox"
                aria-activedescendant={
                  filteredOptions[highlightedIndex]
                    ? `${selectId}-${filteredOptions[highlightedIndex].value}`
                    : undefined
                }
                className="max-h-60 overflow-auto p-1"
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-2 py-1.5 text-sm text-muted-foreground">No options found</li>
                ) : (
                  filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      id={`${selectId}-${option.value}`}
                      role="option"
                      aria-selected={option.value === value}
                      aria-disabled={option.disabled}
                      onClick={() => handleOptionClick(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-10 pr-2 text-sm outline-none transition-colors',
                        option.disabled && 'cursor-not-allowed opacity-50',
                        index === highlightedIndex && 'bg-accent text-accent-foreground',
                        option.value === value && 'bg-accent/50'
                      )}
                    >
                      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                        {option.value === value && <Check className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface MultiSelectProps {
  options: SelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  maxSelected?: number;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = 'Select options',
      disabled,
      error,
      className,
      id,
      name,
      'aria-label': ariaLabel,
      maxSelected,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    const selectId = id || React.useId();

    const selectedOptions = React.useMemo(() => {
      return options.filter((opt) => value.includes(opt.value));
    }, [options, value]);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [options, searchQuery]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    React.useEffect(() => {
      if (!isOpen) {
        setSearchQuery('');
        setHighlightedIndex(0);
      }
    }, [isOpen]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen) {
            const option = filteredOptions[highlightedIndex];
            if (option && !option.disabled) {
              const newValue = value.includes(option.value)
                ? value.filter((v) => v !== option.value)
                : maxSelected && value.length >= maxSelected
                  ? value
                  : [...value, option.value];
              onChange?.(newValue);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
        case 'Backspace':
          if (!searchQuery && value.length > 0) {
            event.preventDefault();
            onChange?.(value.slice(0, -1));
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };

    const handleOptionClick = (option: SelectOption) => {
      if (option.disabled) return;
      const newValue = value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : maxSelected && value.length >= maxSelected
          ? value
          : [...value, option.value];
      onChange?.(newValue);
    };

    const handleRemove = (optionValue: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onChange?.(value.filter((v) => v !== optionValue));
    };

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <button
          type="button"
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={ariaLabel ? undefined : selectId}
          aria-label={ariaLabel}
          aria-invalid={error}
          aria-multiselectable={true}
          className={cn(
            'flex min-h-[40px] w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-destructive focus:ring-destructive',
            isOpen && 'ring-2 ring-ring ring-offset-2',
            value.length > 0 && 'gap-1'
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-0.5 text-xs font-medium"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(opt.value, e)}
                    className="rounded-full p-0.5 hover:bg-accent hover:text-accent-foreground"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 opacity-50 transition-transform',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 animate-fade-in">
            <div className="relative rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                  role="combobox"
                  aria-expanded={isOpen}
                  aria-autocomplete="list"
                  aria-controls={`${selectId}-listbox`}
                />
              </div>
              <ul
                ref={listRef}
                id={`${selectId}-listbox`}
                role="listbox"
                aria-activedescendant={
                  filteredOptions[highlightedIndex]
                    ? `${selectId}-${filteredOptions[highlightedIndex].value}`
                    : undefined
                }
                className="max-h-60 overflow-auto p-1"
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-2 py-1.5 text-sm text-muted-foreground">No options found</li>
                ) : (
                  filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      id={`${selectId}-${option.value}`}
                      role="option"
                      aria-selected={value.includes(option.value)}
                      aria-disabled={option.disabled}
                      onClick={() => handleOptionClick(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-10 pr-2 text-sm outline-none transition-colors',
                        option.disabled && 'cursor-not-allowed opacity-50',
                        index === highlightedIndex && 'bg-accent text-accent-foreground',
                        value.includes(option.value) && 'bg-accent/50'
                      )}
                    >
                      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                        {value.includes(option.value) && (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
);
MultiSelect.displayName = 'MultiSelect';

export { Select, MultiSelect };
