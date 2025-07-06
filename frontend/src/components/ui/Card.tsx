import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  gradient?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  gradient = false,
  onClick,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300',
        paddingClasses[padding],
        hover && 'card-hover hover:shadow-2xl hover:border-purple-200/50 dark:hover:border-purple-700/50',
        gradient && 'bg-gradient-to-br from-white/10 to-gray-50/10 dark:from-gray-800/30 dark:to-gray-900/30',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </div>
  );
};

export default Card;