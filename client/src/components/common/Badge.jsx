import React from 'react';

const Badge = ({ children, variant = 'neutral', size = 'md', dot = false, className = '' }) => {
  const variants = {
    primary: 'bg-[#D9F2E6] text-[#2D6A4F] border-[#B3E4CC]',
    success: 'bg-[#D9F2E6] text-[#2D6A4F] border-[#B3E4CC]',
    warning: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
    danger:  'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]',
    info:    'bg-[#E2EBE6] text-[#52796F] border-[#BFCFC7]',
    neutral: 'bg-[#F6F3EE] text-[#55504B] border-[#E8E2DA]'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium'
  };

  const dotColors = {
    primary: 'bg-[#2D6A4F]',
    success: 'bg-[#2D6A4F]',
    warning: 'bg-[#D97706]',
    danger:  'bg-[#DC2626]',
    info:    'bg-[#52796F]',
    neutral: 'bg-[#7B746E]'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
