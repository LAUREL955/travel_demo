import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function VirtualList<T>({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem, 
  keyExtractor,
  overscan = 3,
  className = '',
  onScroll,
  onEndReached,
  endReachedThreshold = 200,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const endReachedRef = useRef(false);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(newScrollTop);
    }

    isScrolling.current = true;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 150);

    if (onEndReached && !loading) {
      const { scrollHeight, clientHeight, scrollTop: currentScrollTop } = e.currentTarget;
      const distanceToBottom = scrollHeight - currentScrollTop - clientHeight;
      
      if (distanceToBottom < endReachedThreshold && !endReachedRef.current) {
        endReachedRef.current = true;
        onEndReached();
        
        setTimeout(() => {
          endReachedRef.current = false;
        }, 500);
      }
    }
  }, [onScroll, onEndReached, loading, endReachedThreshold]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const renderEmpty = () => {
    if (emptyComponent) {
      return emptyComponent;
    }
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: containerHeight }}
      >
        <p className="text-gray-500 dark:text-gray-400 text-center">
          暂无数据
        </p>
      </div>
    );
  };

  const renderLoading = () => {
    if (loadingComponent) {
      return loadingComponent;
    }
    return (
      <div 
        className="flex items-center justify-center"
        style={{ height: containerHeight }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  };

  if (loading && items.length === 0) {
    return renderLoading();
  }

  if (!loading && items.length === 0) {
    return renderEmpty();
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div 
        style={{ 
          height: totalHeight, 
          position: 'relative',
          minHeight: containerHeight
        }}
      >
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            willChange: isScrolling.current ? 'transform' : 'auto'
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item)}
              style={{ 
                height: itemHeight,
                position: 'relative'
              }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      
      {loading && items.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

export type { VirtualListProps };