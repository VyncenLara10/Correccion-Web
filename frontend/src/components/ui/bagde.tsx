import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export function Badge({ 
  className = '', 
  variant = 'default',
  children,
  ...props 
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    danger: 'bg-red-500/20 text-red-400 border-red-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
  };

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}