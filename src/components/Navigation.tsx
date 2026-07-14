/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface NavigationProps {
  currentTab: 'dashboard' | 'collection' | 'graveyard' | 'add';
  setTab: (tab: 'dashboard' | 'collection' | 'graveyard' | 'add') => void;
  onSearchToggle?: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Navigation({
  currentTab,
  setTab,
  onSearchToggle,
  showSearch = false,
  searchQuery = '',
  setSearchQuery,
}: NavigationProps) {
  return (
    <>
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#faf9f4]/80 backdrop-blur-md z-40 flex justify-between items-center px-6 border-b border-[#e3e3de]/50">
        <div 
          onClick={() => setTab('dashboard')}
          className="flex items-center gap-2 hover:bg-[#dee3b9]/20 transition-colors p-2 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#173124] font-semibold">eco</span>
          <h1 className="font-headline text-lg md:text-xl font-bold text-[#173124]">Sprout Journal</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search input */}
          {showSearch && setSearchQuery && (
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hidden sm:block text-xs bg-[#f5f4ef] border border-[#c2c8c2] rounded-full px-4 py-1.5 focus:outline-none focus:border-[#173124] transition-colors w-40"
            />
          )}
          <button 
            onClick={onSearchToggle}
            className="p-2 rounded-full hover:bg-[#dee3b9]/20 text-[#173124] transition-colors cursor-pointer active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      {/* Desktop Navigation Sidebar (Left-aligned, visible on md and up) */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-[#faf9f4] flex-col gap-4 p-6 border-r border-[#e3e3de]/40 z-30 shadow-sm">
        <div className="font-sans text-xs font-semibold text-[#727973] uppercase tracking-widest px-2 mb-2">
          Navigation
        </div>
        
        <button
          onClick={() => setTab('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-[#2d4739] text-[#ffffff] shadow-sm'
              : 'text-[#1b1c19] hover:bg-[#efeee9] hover:text-[#173124]'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </button>

        <button
          onClick={() => setTab('collection')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all cursor-pointer ${
            currentTab === 'collection'
              ? 'bg-[#2d4739] text-[#ffffff] shadow-sm'
              : 'text-[#1b1c19] hover:bg-[#efeee9] hover:text-[#173124]'
          }`}
        >
          <span className="material-symbols-outlined">potted_plant</span>
          My Jungle
        </button>

        <button
          onClick={() => setTab('graveyard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all cursor-pointer ${
            currentTab === 'graveyard'
              ? 'bg-[#2d4739] text-[#ffffff] shadow-sm'
              : 'text-[#1b1c19] hover:bg-[#efeee9] hover:text-[#173124]'
          }`}
        >
          <span className="material-symbols-outlined">deceased</span>
          Graveyard
        </button>

        <button
          onClick={() => setTab('add')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all cursor-pointer ${
            currentTab === 'add'
              ? 'bg-[#2d4739] text-[#ffffff] shadow-sm'
              : 'text-[#1b1c19] hover:bg-[#efeee9] hover:text-[#173124]'
          }`}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Sprout
        </button>

        {/* Footer info inside sidebar */}
        <div className="mt-auto px-4 py-3 bg-[#f5f4ef] rounded-xl border border-[#e3e3de] text-center">
          <p className="font-sans text-[11px] text-[#424844] font-medium leading-relaxed">
            Nurtured with care.
          </p>
          <p className="font-sans text-[10px] text-[#727973] mt-0.5">
            Sprout Journal &copy; 2026
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#faf9f4] border-t border-[#e3e3de]/50 shadow-[0_-4px_20px_rgba(45,71,57,0.05)] z-40 flex justify-around items-center px-4 pb-4 pt-2">
        <button
          onClick={() => setTab('dashboard')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'bg-[#2d4739] text-[#ffffff] scale-95 shadow-sm'
              : 'text-[#727973]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="font-sans text-[10px] mt-0.5 font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setTab('collection')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            currentTab === 'collection'
              ? 'bg-[#2d4739] text-[#ffffff] scale-95 shadow-sm'
              : 'text-[#727973]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">potted_plant</span>
          <span className="font-sans text-[10px] mt-0.5 font-medium">Collection</span>
        </button>

        <button
          onClick={() => setTab('add')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            currentTab === 'add'
              ? 'bg-[#2d4739] text-[#ffffff] scale-95 shadow-sm'
              : 'text-[#727973]'
          }`}
        >
          <span className="material-symbols-outlined text-xl font-semibold">add_circle</span>
          <span className="font-sans text-[10px] mt-0.5 font-medium">Add Sprout</span>
        </button>

        <button
          onClick={() => setTab('graveyard')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            currentTab === 'graveyard'
              ? 'bg-[#2d4739] text-[#ffffff] scale-95 shadow-sm'
              : 'text-[#727973]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">deceased</span>
          <span className="font-sans text-[10px] mt-0.5 font-medium">Graveyard</span>
        </button>
      </nav>
    </>
  );
}
