import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'shimmer' | 'none';
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', animation = 'pulse', width, height, style, ...props }, ref) => {
    const variantClasses = {
      text: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    const animationClasses = {
      pulse: 'animate-pulse bg-muted',
      shimmer:
        'animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]',
      none: 'bg-muted',
    };

    const baseClasses = variantClasses[variant];

    return (
      <div
        ref={ref}
        className={cn(animationClasses[animation], baseClasses, className)}
        style={{
          width: width ?? (variant === 'text' ? '100%' : undefined),
          height: height ?? (variant === 'text' ? '1em' : undefined),
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

function SkeletonText({
  lines = 3,
  lastLineWidth = '80%',
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          style={{
            width: index === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
}

function SkeletonCard({
  showAvatar = true,
  showImage = false,
  lines = 3,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-4', className)} {...props}>
      {showImage && <Skeleton variant="rectangular" height={160} className="w-full" />}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" style={{ width: '60%' }} />
            <Skeleton variant="text" style={{ width: '40%' }} />
          </div>
        </div>
      )}
      <SkeletonText lines={lines} />
    </div>
  );
}

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
}

function SkeletonTable({ rows = 5, columns = 4, className, ...props }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable };
