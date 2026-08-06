import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { className: 'h-4 w-4 text-[#7B746E]' });
    }
    const Icon = icon;
    return <Icon className="h-4 w-4 text-[#7B746E]" />;
  };

  const hasIcon = !!icon;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <div className="relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {renderIcon()}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full rounded-xl text-sm transition-all duration-150
            ${hasIcon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5
            bg-white text-[#2E2A26] placeholder-[#7B746E]/60
            border ${error ? 'border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#E8E2DA] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15'}
            focus:outline-none shadow-sm
            disabled:bg-[#F6F3EE] disabled:text-[#7B746E] disabled:cursor-not-allowed
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p>
      )}
    </div>
  );
};

export default Input;
