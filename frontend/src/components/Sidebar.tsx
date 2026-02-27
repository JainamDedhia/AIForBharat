import { LayoutDashboard, BarChart2, Languages, Clock, Settings } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const navItems: { icon: typeof LayoutDashboard; label: string; page: Page }[] = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: BarChart2, label: 'Analyze', page: 'analyze' },
    { icon: Languages, label: 'Dub', page: 'dub' },
    { icon: Clock, label: 'History', page: 'history' },
    { icon: Settings, label: 'Settings', page: 'settings' },
  ];

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] bg-[#080808] border-r border-[#1C1C1C] flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
            <span className="text-[15px] font-semibold text-white">CreatorMentor</span>
          </div>
          <p className="text-[11px] text-[#555555]">Content Intelligence</p>
        </div>

        <div className="h-px bg-[#1C1C1C] mx-4"></div>

        <nav className="flex-1 px-3 py-4">
          {navItems.map(({ icon: Icon, label, page }) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
                currentPage === page
                  ? 'bg-[#1A1A1A] text-white border-l-2 border-white'
                  : 'text-[#888888] hover:bg-[#111111] hover:text-[#CCCCCC]'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <div className="h-px bg-[#1C1C1C] mb-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[11px] text-white font-medium">
              CM
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-white">Creator</p>
              <span className="inline-block mt-0.5 text-[10px] text-[#888888] bg-[#1C1C1C] border border-[#2A2A2A] rounded px-2 py-0.5">
                Pro
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080808] border-t border-[#1C1C1C] flex items-center justify-around z-50">
        {navItems.map(({ icon: Icon, page }) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 ${
              currentPage === page ? 'text-white bg-[#1A1A1A]' : 'text-[#888888]'
            }`}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
    </>
  );
}
