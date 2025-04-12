import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
  hoverEffect?: boolean;
}

/**
 * PremiumGlassCard component with advanced glass morphism effects
 * 
 * @example
 * <PremiumGlassCard>
 *   <h3>Premium Content</h3>
 *   <p>This card has a premium glass effect</p>
 * </PremiumGlassCard>
 */
export function PremiumGlassCard({
  children,
  className,
  variant = 'default',
  hoverEffect = true,
  ...props
}: PremiumGlassCardProps) {
  const variantClasses = {
    default: 'premium-glass-card',
    elevated: 'premium-glass-card shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
    subtle: 'premium-glass-card bg-gradient-to-br from-black/20 via-black/10 to-black/5'
  };
  
  return (
    <div 
      className={cn(
        variantClasses[variant],
        hoverEffect && 'card-hover',
        'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 