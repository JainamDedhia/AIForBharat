import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
}

export default function Badge({ children, variant = 'light', className = '' }: BadgeProps) {
  // The base pill shape and text sizing
  const baseStyles = "inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide transition-all duration-300";

  // Background styles depending on the variant
  const variants = {
    light: "bg-gradient-to-br from-[#ffffff] via-[#ffffff] shadow-sm", 
    dark: "bg-[#111111] border border-[#2A2A2A]"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {/* This span applies the aesthetic color-shifting text effect 
        using a background clip gradient to perfectly match your image 
      */}
      <span className="bg-black bg-clip-text text-transparent drop-shadow-sm">
        {children}
      </span>
    </span>
  );
}