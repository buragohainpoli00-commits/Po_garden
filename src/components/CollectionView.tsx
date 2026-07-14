/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plant } from '../types';

interface CollectionViewProps {
  key?: React.Key;
  plants: Plant[];
  onSelectPlant: (plantId: string) => void;
  setTab: (tab: 'dashboard' | 'collection' | 'graveyard' | 'add') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CollectionView({
  plants,
  onSelectPlant,
  setTab,
  searchQuery,
  setSearchQuery,
}: CollectionViewProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');

  // Alive plants
  const alivePlants = plants.filter((p) => p.status === 'alive');

  // Filter unique locations
  const locations = ['All Locations', ...Array.from(new Set(alivePlants.map((p) => p.location)))];

  // Filter list
  const filteredPlants = alivePlants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty = selectedDifficulty === 'all' || plant.difficulty === selectedDifficulty;
    const matchesLocation = selectedLocation === 'All Locations' || plant.location === selectedLocation;

    return matchesSearch && matchesDifficulty && matchesLocation;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8"
    >
      {/* Title block */}
      <div className="w-full text-center max-w-2xl mx-auto mb-2">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#173124] tracking-tight mb-2">
          My Jungle
        </h2>
        <p className="font-sans text-sm text-[#424844] font-medium leading-relaxed">
          The thriving canopy of your botanical companions. Track their details, growth status, and light environments.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl p-4 shadow-[0_4px_20px_rgba(45,71,57,0.02)] flex flex-col gap-4">
        {/* Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-4 text-[#727973] text-lg font-semibold pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search by nickname, species, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f5f4ef] border border-[#c2c8c2] focus:border-[#173124] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-colors placeholder:text-[#727973]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-[#727973] hover:text-[#173124]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Difficulty Chips Filter */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-semibold text-[#173124] uppercase tracking-wider px-1">
            Maintenance Level
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all cursor-pointer ${
                selectedDifficulty === 'all'
                  ? 'bg-[#2d4739] text-[#ffffff] border-[#2d4739]'
                  : 'bg-transparent text-[#727973] border-[#c2c8c2] hover:bg-[#efeee9]'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setSelectedDifficulty('easy')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all cursor-pointer ${
                selectedDifficulty === 'easy'
                  ? 'bg-[#dee3b9] text-[#606644] border-[#dee3b9]'
                  : 'bg-transparent text-[#727973] border-[#c2c8c2] hover:bg-[#efeee9]'
              }`}
            >
              Chill & Forgiving
            </button>
            <button
              onClick={() => setSelectedDifficulty('medium')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all cursor-pointer ${
                selectedDifficulty === 'medium'
                  ? 'bg-[#dee3b9] text-[#606644] border-[#dee3b9]'
                  : 'bg-transparent text-[#727973] border-[#c2c8c2] hover:bg-[#efeee9]'
              }`}
            >
              Needs Routine
            </button>
            <button
              onClick={() => setSelectedDifficulty('hard')}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all cursor-pointer ${
                selectedDifficulty === 'hard'
                  ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                  : 'bg-transparent text-[#727973] border-[#c2c8c2] hover:bg-[#efeee9]'
              }`}
            >
              Drama Queen
            </button>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-semibold text-[#173124] uppercase tracking-wider px-1">
            Location
          </label>
          <div className="flex flex-wrap gap-1.5">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1 rounded-md text-xs font-sans font-medium border transition-colors cursor-pointer ${
                  selectedLocation === loc
                    ? 'bg-[#efeee9] text-[#173124] border-[#173124]'
                    : 'bg-transparent text-[#727973] border-[#e3e3de] hover:bg-[#efeee9]'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div className="bg-[#ffffff] border border-[#c2c8c2] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-4xl text-[#727973]">sentiment_dissatisfied</span>
          <p className="font-headline text-base font-semibold text-[#173124]">No sprouts match your filter</p>
          <p className="font-sans text-xs text-[#727973]">Try revising your keywords or filters!</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
              setSelectedLocation('All Locations');
            }}
            className="mt-2 text-xs font-semibold text-[#173124] underline hover:no-underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlants.map((plant) => (
            <motion.div
              key={plant.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectPlant(plant.id)}
              className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(45,71,57,0.02)] flex flex-col relative group cursor-pointer hover:border-[#173124] transition-colors"
            >
              <div className="h-40 w-full relative overflow-hidden bg-[#efeee9]">
                <img
                  src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=256'}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 right-2.5 bg-[#ffffff]/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 border border-[#e3e3de] text-[#173124]">
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    {plant.tags.join(' ').toLowerCase().includes('direct') ? 'sunny' : 'bedtime'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1 overflow-hidden">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="font-headline text-sm font-semibold text-[#1b1c19] truncate group-hover:text-[#173124]">
                    {plant.name}
                  </h4>
                  <span className="shrink-0 bg-[#2d4739]/5 text-[#173124] text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full">
                    {plant.streak}d streak
                  </span>
                </div>
                <p className="font-sans text-[11px] text-[#727973] truncate">{plant.species}</p>
                
                <div className="mt-2 pt-2 border-t border-[#f5f4ef] flex items-center justify-between">
                  <span className="font-sans text-[10px] text-[#424844] font-medium flex items-center gap-0.5 truncate">
                    <span className="material-symbols-outlined text-[11px] text-[#5c6140]">location_on</span>
                    {plant.location}
                  </span>
                  
                  {plant.difficulty === 'easy' && (
                    <span className="text-[10px] text-[#606644] font-semibold bg-[#dee3b9]/50 px-1.5 py-0.5 rounded">
                      Chill
                    </span>
                  )}
                  {plant.difficulty === 'medium' && (
                    <span className="text-[10px] text-[#606644] font-semibold bg-[#dee3b9]/50 px-1.5 py-0.5 rounded">
                      Routine
                    </span>
                  )}
                  {plant.difficulty === 'hard' && (
                    <span className="text-[10px] text-[#ba1a1a] font-semibold bg-[#ffdad6] px-1.5 py-0.5 rounded">
                      Drama
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
