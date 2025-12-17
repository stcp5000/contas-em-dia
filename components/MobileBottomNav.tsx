import React from 'react';
import { Home, PlusCircle, BarChart3 } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50 h-[70px] flex justify-between items-start">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'home' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-slate-100' : ''}`} />
        <span className="text-[10px] font-medium">Início</span>
      </button>

      <button 
        onClick={() => setActiveTab('add')}
        className="relative -top-6 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95"
      >
        <PlusCircle className="w-7 h-7" />
      </button>

      <button 
        onClick={() => setActiveTab('insights')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === 'insights' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <BarChart3 className={`w-6 h-6 ${activeTab === 'insights' ? 'fill-slate-100' : ''}`} />
        <span className="text-[10px] font-medium">Insights</span>
      </button>
    </div>
  );
};