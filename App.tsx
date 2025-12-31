
import React, { useState } from 'react';
import { ViewMode } from './types';
import Sidebar from './Sidebar';
import ChatView from './ChatView';
import ImageView from './ImageView';
import DeploymentHelper from './DeploymentHelper';
import LiveView from './LiveView';
import GalleryView from './GalleryView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.CHAT);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewMode.CHAT:
        return <ChatView />;
      case ViewMode.IMAGE:
        return <ImageView />;
      case ViewMode.LIVE:
        return <LiveView />;
      case ViewMode.DEPLOY:
        return <DeploymentHelper />;
      case ViewMode.GALLERY:
        return <GalleryView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-inter">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className="flex-1 relative flex flex-col overflow-hidden transition-all duration-300">
        <header className="h-16 glass flex items-center justify-between px-6 border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 border border-yellow-300/30">
              <i className="fa-solid fa-mug-hot text-black text-sm"></i>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic hidden sm:block">
              Wojtek <span className="gradient-text">Germanek</span> Studio
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title={isFullscreen ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
            >
              <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>

            <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-yellow-500 uppercase">System Resetu Aktywny</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto relative bg-[#020617]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
