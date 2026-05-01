import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  maxItems?: number;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = <ChevronRight size={16} />,
      showHome = true,
      maxItems = 4,
      className,
      ...props
    },
    ref
  ) => {
    const allItems = React.useMemo(() => {
      const result = [...items];
      if (showHome) {
        result.unshift({
          label: <Home size={16} />,
          href: '/',
        });
      }
      return result;
    }, [items, showHome]);

    const renderItems = () => {
      if (allItems.length <= maxItems) {
        return allItems.map((item, index) =>
          renderItem(item, index, index === allItems.length - 1)
        );
      }

      const firstItem = allItems[0];
      const lastItems = allItems.slice(-2);

      return (
        <>
          {renderItem(firstItem, 0, false)}
          <li className="flex items-center">
            <span className="flex items-center px-1 text-muted-foreground">
              <MoreHorizontal size={16} />
            </span>
            <span className="mx-1 text-muted-foreground rtl:rotate-180">{separator}</span>
          </li>
          {lastItems.map((item, index) =>
            renderItem(item, allItems.length - 2 + index, index === lastItems.length - 1)
          )}
        </>
      );
    };

    const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => (
      <li key={index} className="flex items-center">
        {item.href && !isLast ? (
          <Link
            href={item.href}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            {item.label}
          </Link>
        ) : (
          <span
            className={cn(
              'text-sm font-medium',
              isLast ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </span>
        )}
        {!isLast && (
          <span className="mx-2 text-muted-foreground rtl:rotate-180 shrink-0">{separator}</span>
        )}
      </li>
    );

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex overflow-x-auto whitespace-nowrap py-1', className)}
        {...props}
      >
        <ol className="flex items-center">{renderItems()}</ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
