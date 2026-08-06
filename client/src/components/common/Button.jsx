import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl outline-none select-none cursor-pointer';
  
  const variants = {
    primary: 'text-white bg-[#2D6A4F] hover:bg-[#245741] active:bg-[#1B4532] shadow-sm hover:shadow-md border border-transparent',
    secondary: 'text-[#2E2A26] bg-white border border-[#E8E2DA] hover:bg-[#F6F3EE] active:bg-[#E8E2DA] shadow-sm',
    danger: 'text-white bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] shadow-sm border border-transparent',
    ghost: 'text-[#55504B] hover:bg-[#F6F3EE] hover:text-[#2E2A26] active:bg-[#E8E2DA] border border-transparent',
    outline: 'text-[#2D6A4F] border border-[#2D6A4F] hover:bg-[#F0FAF5] active:bg-[#D9F2E6]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold'
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed shadow-none' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        typeof Icon === 'function' || typeof Icon === 'object' ? <Icon className="h-4 w-4 shrink-0" /> : Icon
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
