import { TrendingUp } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ variant = 'default', size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const iconColors = {
    default: 'text-brand-primary',
    light: 'text-white',
    dark: 'text-brand-primary',
  };

  const textColors = {
    default: 'text-foreground',
    light: 'text-white',
    dark: 'text-foreground',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${iconColors[variant]} flex items-center justify-center`}>
        <TrendingUp className={iconSizes[size]} strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} ${textColors[variant]}`}>
          Tikal<span className="text-brand-secondary">Invest</span>
        </span>
      )}
    </div>
  );
}
