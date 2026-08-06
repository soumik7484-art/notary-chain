import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  gradient = false,
  padding = 'p-6',
  onClick
}) => {
  const Component = onClick || hover ? motion.div : 'div';
  
  const hoverProps = (onClick || hover) ? {
    whileHover: { y: -2, transition: { duration: 0.15 } },
    className: 'cursor-pointer hover:shadow-card-hover hover:border-[#D4CECA]'
  } : {};

  return (
    <Component
      onClick={onClick}
      {...hoverProps}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white border border-[#E8E2DA]
        shadow-card transition-all duration-200
        ${padding}
        ${hoverProps.className || ''}
        ${className}
      `}
    >
      {gradient && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D6A4F] to-[#52796F]" />
      )}
      {children}
    </Component>
  );
};

export default Card;
