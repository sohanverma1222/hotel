'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon, Loader2 } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  className, 
  width, 
  height,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==",
  fallback,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const DefaultFallback = () => (
    <div className={cn(
      "flex items-center justify-center bg-muted text-muted-foreground",
      className
    )} style={{ width, height }}>
      <div className="text-center">
        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Image not available</p>
      </div>
    </div>
  );

  const LoadingPlaceholder = () => (
    <div className={cn(
      "flex items-center justify-center bg-muted text-muted-foreground animate-pulse",
      className
    )} style={{ width, height }}>
      <div className="text-center">
        <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );

  if (hasError) {
    return fallback ? <>{fallback}</> : <DefaultFallback />;
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {isLoading && <LoadingPlaceholder />}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0 absolute inset-0" : "opacity-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}