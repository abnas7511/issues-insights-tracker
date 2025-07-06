import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  fullWidth,
  className,
  ...props
}) => {
  const inputClasses = clsx(
    'block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-300',
    'focus:border-purple-500 focus:ring-purple-500 focus:ring-2',
    'disabled:bg-gray-50 disabled:text-gray-500',
    'bg-transparent text-black dark:text-white placeholder-gray-400',
    'hover:border-purple-400 dark:hover:border-purple-500',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    Icon && iconPosition === 'left' && 'pl-10',
    Icon && iconPosition === 'right' && 'pr-10',
    className
  );

  return (
    <div className={clsx('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <label className="block text-sm font-semibold text-white">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={clsx(
            'absolute inset-y-0 flex items-center pointer-events-none',
            iconPosition === 'left' ? 'left-3' : 'right-3'
          )}>
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;