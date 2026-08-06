import React from 'react';

const DashboardLayout = ({ title, subtitle, actions, children }) => {
  return (
    <div className="w-full">
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6 border-b border-[#E8E2DA]">
          <div>
            {title && <h1 className="font-display text-2xl sm:text-3xl font-700 text-[#2E2A26] tracking-tight">{title}</h1>}
            {subtitle && <p className="text-[#55504B] mt-1 text-xs font-medium">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex gap-3 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
