import * as React from 'react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
  size = 'md',
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size} onClick={handleBackdropClick}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={disabled || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface ConfirmDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function ConfirmDialogTrigger({ children, ...props }: ConfirmDialogTriggerProps) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export { ConfirmDialog, ConfirmDialogTrigger };
