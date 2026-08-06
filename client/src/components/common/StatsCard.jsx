import React, { useEffect, useState } from 'react';
import Card from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'primary',
  loading = false,
  className = '',
  subtitle
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading || isNaN(value)) return;
    const end = parseFloat(value);
    const duration = 800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const inc = end / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, loading]);

  if (loading) return <LoadingSkeleton type="stats" count={1} className={className} />;

  return (
    <Card hover className={`overflow-hidden border-t-2 border-t-[#2D6A4F] ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-xs font-semibold text-[#7B746E] uppercase tracking-wider mb-1.5">{title}</h4>
          <div className="text-2xl font-bold text-[#2E2A26] font-display">
            {typeof value === 'number' ? (Number.isInteger(value) ? Math.floor(displayValue) : displayValue.toFixed(1)) : value}
          </div>
          {subtitle && <p className="text-xs text-[#7B746E] mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]">
            {typeof Icon === 'function' || typeof Icon === 'object' ? <Icon className="w-5 h-5" /> : Icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#E8E2DA]">
          <div className={`flex items-center text-xs font-semibold ${trendDirection === 'up' ? 'text-[#2D6A4F]' : 'text-[#DC2626]'}`}>
            {trendDirection === 'up' ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            <span>{trend}%</span>
          </div>
          <span className="text-xs text-[#7B746E]">vs last period</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
