/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plant, CareLog } from '../types';

interface DashboardViewProps {
  key?: React.Key;
  plants: Plant[];
  onWater: (plantId: string) => void;
  onSelectPlant: (plantId: string) => void;
  setTab: (tab: 'dashboard' | 'collection' | 'graveyard' | 'add') => void;
}

export default function DashboardView({
  plants,
  onWater,
  onSelectPlant,
  setTab,
}: DashboardViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter alive plants
  const alivePlants = plants.filter((p) => p.status === 'alive');

  // Plants needing water today (e.g. sorted by thirst or calculated dry state)
  // Let's mark plants as needing water if their last watered is older than their frequency interval
  // For the sake of the mockup, Fiddle Leaf Fig and Golden Pothos will be featured
  const wateringToday = alivePlants.filter((p) => {
    // Show plants that have not been watered today
    const lastWateredDate = new Date(p.lastWatered);
    const today = new Date();
    return lastWateredDate.toDateString() !== today.toDateString();
  });

  // Streaks list sorted by highest streak descending
  const streaksList = [...alivePlants]
    .filter((p) => p.streak > 0)
    .sort((a, b) => b.streak - a.streak);

  // Helper to determine dry level text based on thirstLevel & days dry
  const getDryStatus = (plant: Plant) => {
    const daysSinceWatered = Math.floor(
      (Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceWatered <= 0) return { text: 'Healthy', color: 'text-[#173124]', bg: 'bg-[#173124]/10' };
    if (plant.thirstLevel >= 4) {
      if (daysSinceWatered >= 2) return { text: 'Low Water', color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]' };
      return { text: 'Medium Dry', color: 'text-[#5c6140]', bg: 'bg-[#dee3b9]' };
    }
    if (plant.thirstLevel <= 2) {
      if (daysSinceWatered >= 10) return { text: 'Bone Dry', color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]' };
      return { text: 'Dry', color: 'text-[#5c6140]', bg: 'bg-[#dee3b9]' };
    }
    if (daysSinceWatered >= 5) return { text: 'Low Water', color: 'text-[#ba1a1a]', bg: 'bg-[#ffdad6]' };
    return { text: 'Medium Dry', color: 'text-[#5c6140]', bg: 'bg-[#dee3b9]' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-10"
    >
      {/* Welcome Banner */}
      <div className="w-full text-center py-2 md:text-left md:py-0">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#173124] tracking-tight mb-2 leading-tight">
          Welcome to Your Oasis
        </h2>
        <p className="font-sans text-sm md:text-base text-[#424844] font-medium max-w-xl">
          Nurturing lives, one droplet at a time. Here is your daily botanical status report.
        </p>
      </div>

      {/* Section: Current Streaks */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-headline text-xl font-bold text-[#173124]">Current Streaks</h3>
          <button
            onClick={() => setTab('collection')}
            className="font-sans text-xs font-semibold text-[#727973] hover:text-[#173124] transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {streaksList.length === 0 ? (
          <div className="bg-[#ffffff] border border-[#c2c8c2] rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#727973] mb-2">local_fire_department</span>
            <p className="font-sans text-sm text-[#424844] font-medium">No active care streaks yet.</p>
            <p className="font-sans text-xs text-[#727973] mt-1">Water your plants daily to build streaks!</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 snap-x">
            {streaksList.map((plant) => (
              <motion.div
                key={plant.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelectPlant(plant.id)}
                className="snap-start shrink-0 w-64 bg-[#ffffff] border border-[#e3e3de] rounded-2xl p-4 shadow-[0_4px_20px_rgba(45,71,57,0.03)] flex flex-col gap-3 relative overflow-hidden group cursor-pointer hover:border-[#173124] transition-colors"
              >
                <div className="absolute inset-0 bg-[#dee3b9] opacity-0 group-hover:opacity-[0.06] transition-opacity pointer-events-none"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-[#e3e3de]">
                    <img
                      src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=256'}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h4 className="font-headline text-sm font-semibold text-[#1b1c19] truncate group-hover:text-[#173124] transition-colors">
                      {plant.name}
                    </h4>
                    <p className="font-sans text-[11px] text-[#727973] truncate">{plant.species}</p>
                    <p className="font-sans text-[10px] text-[#424844] font-medium mt-0.5 truncate flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px] text-[#5c6140]">location_on</span>
                      {plant.location}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 bg-[#2d4739]/5 px-3 py-2 rounded-xl border border-[#2d4739]/10">
                  <span className="material-symbols-outlined text-[#173124] text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  <span className="font-sans text-xs font-semibold text-[#173124]">
                    {plant.streak} {plant.streak === 1 ? 'Day' : 'Days'} Thriving
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Watering Today */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline text-xl font-bold text-[#173124]">Watering Today</h3>

        <AnimatePresence mode="popLayout">
          {wateringToday.length === 0 ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2d4739]/5 border border-[#dee3b9] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-4xl text-[#5c6140] animate-bounce">check_circle</span>
              <p className="font-headline text-base font-semibold text-[#173124]">All plants are hydrated!</p>
              <p className="font-sans text-xs text-[#727973]">You have no urgent watering tasks pending. Great work!</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {wateringToday.map((plant) => {
                const status = getDryStatus(plant);
                return (
                  <motion.div
                    key={plant.id}
                    layoutId={`watering-task-${plant.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(45,71,57,0.02)] hover:border-[#5c6140]/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#e3e3de] cursor-pointer" onClick={() => onSelectPlant(plant.id)}>
                        <img
                          src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=256'}
                          alt={plant.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <h4 className="font-headline text-sm font-semibold text-[#1b1c19] truncate cursor-pointer hover:text-[#173124]" onClick={() => onSelectPlant(plant.id)}>
                          {plant.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Organic progress bar */}
                          <div className="w-16 h-1.5 bg-[#efeee9] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                plant.thirstLevel >= 4 ? 'bg-[#5a0d02]' : 'bg-[#2d4739]'
                              }`}
                              style={{ width: `${(plant.thirstLevel / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`font-sans text-[11px] font-semibold ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onWater(plant.id)}
                      className="w-10 h-10 rounded-full border border-[#outline] flex items-center justify-center hover:bg-[#173124] hover:border-[#173124] hover:text-[#ffffff] text-[#727973] transition-colors duration-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg font-semibold">water_drop</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Section: Your Jungle (Grid) */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-headline text-xl font-bold text-[#173124]">Your Jungle</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'text-[#173124] bg-[#dee3b9]/40' : 'text-[#727973] hover:text-[#173124]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'list' ? 'text-[#173124] bg-[#dee3b9]/40' : 'text-[#727973] hover:text-[#173124]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">view_list</span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Add New Plant Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setTab('add')}
              className="bg-[#faf9f4]/60 border border-dashed border-[#173124]/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 min-h-[190px] hover:bg-[#efeee9] hover:border-[#173124] transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#173124]/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#173124]/10 transition-all duration-200">
                <span className="material-symbols-outlined text-[#173124] text-xl font-bold">add</span>
              </div>
              <span className="font-sans text-xs font-semibold text-[#173124]">Add New Plant</span>
            </motion.button>

            {/* Jungle Cards */}
            {alivePlants.map((plant) => (
              <motion.div
                key={plant.id}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => onSelectPlant(plant.id)}
                className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(45,71,57,0.02)] flex flex-col relative group cursor-pointer hover:border-[#173124] transition-colors"
              >
                <div className="h-32 w-full relative overflow-hidden bg-[#efeee9]">
                  <img
                    src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=256'}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Sunny or Bedtime icon badge based on tags */}
                  <div className="absolute top-2.5 right-2.5 bg-[#ffffff]/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 border border-[#e3e3de] text-[#173124]">
                    <span className="material-symbols-outlined text-[13px] font-bold">
                      {plant.tags.join(' ').toLowerCase().includes('direct') ? 'sunny' : 'bedtime'}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-0.5 overflow-hidden">
                  <h4 className="font-headline text-sm font-semibold text-[#1b1c19] truncate group-hover:text-[#173124]">
                    {plant.name}
                  </h4>
                  <p className="font-sans text-[11px] text-[#727973] truncate">{plant.species}</p>
                  <p className="font-sans text-[10px] text-[#424844] mt-1 flex items-center gap-0.5 truncate">
                    <span className="material-symbols-outlined text-[11px] text-[#5c6140]">location_on</span>
                    {plant.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alivePlants.map((plant) => (
              <motion.div
                key={plant.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectPlant(plant.id)}
                className="bg-[#ffffff] border border-[#e3e3de] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-[#173124] transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#e3e3de]">
                    <img
                      src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=256'}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h4 className="font-headline text-sm font-semibold text-[#1b1c19] truncate">{plant.name}</h4>
                    <p className="font-sans text-[11px] text-[#727973] truncate">{plant.species}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-block bg-[#f5f4ef] text-[#727973] px-2 py-0.5 rounded text-[10px] font-sans">
                    {plant.location}
                  </span>
                  <span className="font-sans text-xs font-semibold text-[#173124] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">local_fire_department</span>
                    {plant.streak}d
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
