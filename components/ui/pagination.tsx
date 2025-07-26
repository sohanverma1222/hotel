'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  showInfo = true 
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      if (currentPage <= 4) {
        // Show first 5 pages, ellipsis, and last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page, ellipsis, and last 5 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers();
  const startItem = (currentPage - 1) * (itemsPerPage || 10) + 1;
  const endItem = Math.min(currentPage * (itemsPerPage || 10), totalItems || 0);

  return (
    <div className="flex items-center justify-between px-2">
      {showInfo && totalItems && itemsPerPage && (
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 w-8 p-0",
                  currentPage === page && "bg-primary text-primary-foreground"
                )}
              >
                {page}
              </Button>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}