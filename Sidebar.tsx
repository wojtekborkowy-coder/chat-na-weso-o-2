
import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { id: ViewMode.CHAT, icon: 'fa-face-laugh-wink', label: 'Wojtek Germanek' },
    { id: ViewMode.GALLERY, icon: 'fa-star', label: 'Galeria Legendy' },
    { id: ViewMode.IMAGE, icon: 'fa-palette', label: 'Wojtek Maluje' },
    { id: ViewMode.LIVE, icon: 'fa-headset', label: 'Pogadaj z Wojtkiem' },
    { id: ViewMode.DEPLOY, icon: 'fa-gears', label: 'Konfiguracja' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} glass border-r border-white/5 flex flex-col h-full shrink-0 z-20 transition-all duration-300 ease-in-out`}>
      {/* Toggle Button */}
      <div className={`p-4 border-b border-white/5 flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <button 
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-xl hover:bg-white/5 text-gray-500 hover:text-yellow-500 transition-colors flex items-center justify-center"
          title={isCollapsed ? "Rozwiń panel" : "Zwiń panel"}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'} text-sm`}></i>
        </button>
      </div>

      <div className="p-4 flex-1">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                activeView === item.id
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
              {!isCollapsed && <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">{item.label}</span>}
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl whitespace-nowrap border-2 border-black">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-3 border border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Status: Gotowy"></div>
          ) : (
            <>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Status Resetu</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-yellow-500 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                Wojtek gotowy
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
