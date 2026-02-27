import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors duration-200 disabled:opacity-30';

  const variants = {
    primary: 'bg-white text-[#080808] hover:bg-[#E5E5E5] px-6 py-2.5 text-[13px]',
    secondary: 'bg-transparent border border-[#1C1C1C] text-[#888888] hover:bg-[#111111] hover:text-white px-6 py-2.5 text-[13px]',
    danger: 'bg-transparent border border-[#EF444433] text-[#EF4444] hover:bg-[#EF444411] px-6 py-2.5 text-[13px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
