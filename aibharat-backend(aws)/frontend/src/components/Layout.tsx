import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Page } from '../types';

interface LayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: ReactNode;
  title: string;
  action?: ReactNode;
}

export default function Layout({ currentPage, onPageChange, children, title, action }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808]">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />

      <main className="md:ml-[220px] mb-16 md:mb-0">
        <div className="px-5 md:px-12 py-6 md:py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[22px] font-semibold text-[#F5F5F5]">{title}</h1>
            {action}
          </div>
          <div className="h-px bg-[#1C1C1C] mb-8"></div>
          {children}
        </div>
      </main>
    </div>
  );
}
