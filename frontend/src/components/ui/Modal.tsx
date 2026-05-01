import * as React from 'react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from './Dialog';
import { X } from 'lucide-react';

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export interface ModalTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function ModalTrigger({ children, asChild, ...props }: ModalTriggerProps) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
  preventClose?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
}

function ModalContent({
  className,
  children,
  size = 'md',
  hideCloseButton = false,
  preventClose = false,
  showHeader = true,
  showFooter = false,
  footerContent,
  ...props
}: ModalContentProps) {
  return (
    <DialogContent
      size={size}
      hideCloseButton={hideCloseButton}
      preventClose={preventClose}
      className={cn('flex flex-col', className)}
      {...props}
    >
      {showHeader && (
        <div className="flex items-center justify-between pr-8">
          {children}
        </div>
      )}
      {!showHeader && children}
      {showFooter && footerContent && (
        <div className="flex-shrink-0 border-t mt-4 pt-4">
          {footerContent}
        </div>
      )}
    </DialogContent>
  );
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <DialogHeader
      className={cn('flex-1', className)}
      {...props}
    />
  );
}

export interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <DialogTitle
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

export interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <DialogDescription
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

function ModalBody({ className, ...props }: ModalBodyProps) {
  return (
    <DialogBody
      className={cn('flex-1 min-h-0 py-4', className)}
      {...props}
    />
  );
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <DialogFooter
      className={cn('mt-auto pt-4 border-t', className)}
      {...props}
    />
  );
}

export interface ModalCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function ModalClose({ className, children, ...props }: ModalCloseProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children || 'Close'}
    </button>
  );
}

export { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose };
