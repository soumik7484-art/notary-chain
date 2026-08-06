import React from 'react';

const LoadingSkeleton = ({ type = 'text', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`p-6 rounded-2xl bg-white border border-[#E8E2DA] ${className}`}>
            <div className="h-5 w-1/3 bg-[#F6F3EE] rounded-lg mb-4 animate-pulse" />
            <div className="space-y-2.5">
              <div className="h-4 bg-[#F6F3EE] rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-[#F6F3EE] rounded-lg w-5/6 animate-pulse" />
            </div>
          </div>
        );
      case 'table':
        return (
          <div className={`w-full space-y-3 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-[#E8E2DA]">
                <div className="h-4 bg-[#F6F3EE] rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-[#F6F3EE] rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-[#F6F3EE] rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-[#F6F3EE] rounded w-1/4 animate-pulse" />
              </div>
            ))}
          </div>
        );
      case 'avatar':
        return (
          <div className={`flex items-center gap-3 ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-[#F6F3EE] animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-[#F6F3EE] rounded w-24 animate-pulse" />
              <div className="h-3 bg-[#F6F3EE] rounded w-16 animate-pulse" />
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className={`p-6 rounded-2xl bg-white border border-[#E8E2DA] ${className}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 w-20 bg-[#F6F3EE] rounded animate-pulse" />
              <div className="w-9 h-9 rounded-xl bg-[#F6F3EE] animate-pulse" />
            </div>
            <div className="h-7 w-24 bg-[#F6F3EE] rounded mb-2 animate-pulse" />
            <div className="h-3 w-16 bg-[#F6F3EE] rounded animate-pulse" />
          </div>
        );
      default:
        return (
          <div className={`space-y-2 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="h-4 bg-[#F6F3EE] rounded w-full animate-pulse" />
            ))}
          </div>
        );
    }
  };

  if (type === 'stats' && count > 1) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

export default LoadingSkeleton;
