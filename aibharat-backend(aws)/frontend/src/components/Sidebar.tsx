// src/components/Sidebar.tsx
import { useState } from 'react';
import { 
  LayoutDashboard, BarChart2, Languages, Clock, Settings, PenLine, LogOut, TrendingUp
} from 'lucide-react';
import { Page } from '../types';
import Badge from './Badge';
import { useAuth } from '../context/AuthContext';
import {} from '../pages/Trends'


const CustomToggleIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4.5" ry="4.5" />
    <line x1="10" y1="3" x2="10" y2="21" />
    <path d="M6 9h1" /><path d="M6 15h1" />
  </svg>
);

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems: { icon: typeof LayoutDashboard; label: string; page: Page }[] = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: BarChart2, label: 'Analyze Content', page: 'analyze' },
    { icon: PenLine, label: 'Script Gen', page: 'script' },
    { icon: Languages, label: 'Dub Gen', page: 'dub' },
    { icon: Clock, label: 'History', page: 'history' },
    { icon: TrendingUp, label: 'Trends', page: 'trends' },
    { icon: Settings, label: 'Settings', page: 'settings' },
    
  ];

  // Get initials for avatar
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'GU';

  return (
    <>
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen bg-[#080808] border-r border-[#1C1C1C] flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 ${
        isCollapsed ? 'w-[80px]' : 'w-[240px]'
      }`}>

        {/* Header */}
        <div className="h-[80px] flex items-center relative px-4">
          <div className={`flex items-center overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isCollapsed ? 'w-0 opacity-0' : 'w-[180px] opacity-100'
          }`}>
            <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-[#DF812D] via-[#ECA250] to-[#FFFFFF] rounded-md mr-3" />
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-[15px] font-semibold text-white font-inter leading-tight mb-0.5">CreatorMentor</span>
              <span className="text-[12px] text-[#555555] leading-tight">AI for Bharat</span>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute shrink-0 text-[#888888] hover:text-white transition-all duration-500 p-2 rounded-lg hover:bg-[#1A1A1A] ${
              isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-3'
            }`}
          >
            <CustomToggleIcon size={20} className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="h-px bg-[#1C1C1C] mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden space-y-1">
          {navItems.map(({ icon: Icon, label, page }) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative w-full flex items-center h-[42px] rounded-lg text-[14px] transition-colors duration-200 group overflow-hidden ${
                currentPage === page
                  ? 'bg-[#1A1A1A] text-white border-l-2 border-white'
                  : 'text-[#888888] hover:bg-[#111111] hover:text-[#CCCCCC] border-l-2 border-transparent'
              }`}
              title={isCollapsed ? label : undefined}
            >
              <div className={`absolute left-0 h-full flex items-center justify-center transition-all duration-500 ${
                isCollapsed ? 'w-full' : 'w-[52px]'
              }`}>
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div className={`flex items-center w-full transition-all duration-500 ${
                isCollapsed ? 'opacity-0 pl-[52px]' : 'opacity-100 pl-[52px]'
              }`}>
                <span className="whitespace-nowrap">{label}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer / User */}
        <div className="p-4">
          <div className="h-px bg-[#1C1C1C] mb-4" />
          <div className="relative h-[40px] flex items-center overflow-hidden">
            {/* Avatar */}
            <div className={`absolute left-0 h-full flex items-center justify-center transition-all duration-500 ${
              isCollapsed ? 'w-full' : 'w-[44px]'
            }`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DF812D] to-[#ECA250] flex items-center justify-center text-[11px] text-white font-bold">
                {initials}
              </div>
            </div>

            {/* User info + logout */}
            <div className={`flex items-center justify-between w-full transition-all duration-500 ${
              isCollapsed ? 'opacity-0 pl-[48px]' : 'opacity-100 pl-[48px]'
            }`}>
              <div className="flex flex-col justify-center">
                <p className="text-[13px] text-white whitespace-nowrap leading-none mb-0.5 font-medium">
                  {user?.username || 'Guest'}
                </p>
                <span className="inline-flex text-[10px] text-[#FFFFFF] bg-gradient-to-br from-[#0c0051] via-[#2a229b] to-[#e1e1e1] rounded px-1.5 py-0.5 leading-none font-medium w-fit">
                  Pro
                </span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="text-[#555] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080808] border-t border-[#1C1C1C] flex items-center justify-around z-50">
        {navItems.map(({ icon: Icon, page }) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 ${
              currentPage === page ? 'text-white bg-[#1A1A1A]' : 'text-[#888888]'
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
          </button>
        ))}
        {/* Mobile logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center w-12 h-12 rounded-lg text-[#888888] hover:text-red-400 transition-colors"
        >
          <LogOut size={20} strokeWidth={1.5} />
        </button>
      </div>
    </>
  );
}