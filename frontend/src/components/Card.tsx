import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-[#0F0F0F] border border-[#1C1C1C] rounded-xl ${
        hover ? 'hover:border-[#2A2A2A] transition-colors duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
