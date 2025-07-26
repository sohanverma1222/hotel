'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazyTableProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
  minHeight?: number;
  onVisible?: () => void;
}

export function LazyTable({ 
  children, 
  isLoading = false, 
  loadingMessage = "Loading data...",
  className,
  minHeight = 200,
  onVisible
}: LazyTableProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible?.();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible, onVisible]);

  const LoadingSkeleton = () => (
    <div className="space-y-3 p-4">
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-8 bg-muted rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div 
      ref={tableRef} 
      className={cn("relative", className)}
      style={{ minHeight }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      ) : isVisible ? (
        children
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
}

// Hook for lazy loading data
export function useLazyData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadData = async () => {
    if (hasLoaded && data !== null) return; // Don't reload if already loaded

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset when dependencies change
  useEffect(() => {
    setData(null);
    setHasLoaded(false);
    setError(null);
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    loadData,
    hasLoaded
  };
}