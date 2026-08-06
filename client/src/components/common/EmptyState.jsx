import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-[#E8E2DA] border-dashed shadow-xs ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 bg-[#F0FAF5] text-[#2D6A4F] rounded-2xl flex items-center justify-center mb-4 border border-[#B3E4CC]">
          {typeof Icon === 'function' || typeof Icon === 'object' ? <Icon className="w-7 h-7" /> : Icon}
        </div>
      )}
      <h3 className="text-base font-bold text-[#2E2A26] mb-1.5 font-display">{title}</h3>
      <p className="text-xs text-[#7B746E] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
