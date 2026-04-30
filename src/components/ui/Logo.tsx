import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  isRTL?: boolean;
}

const Logo = ({ size = 'md', showText = true, className, textClassName, isRTL = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-2xl',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showText && (
        <span className={cn(
          "font-arabic font-bold text-primary",
          textSizes[size],
          textClassName
        )}>
          {isRTL ? 'تمور القصيم' : 'Qassim Dates'}
        </span>
      )}
    </div>
  );
};

export default Logo;
