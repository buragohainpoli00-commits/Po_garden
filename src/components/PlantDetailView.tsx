/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plant, CareLog } from '../types';

interface PlantDetailViewProps {
  key?: React.Key;
  plant: Plant;
  onWater: (plantId: string) => void;
  onMoveToGraveyard: (plantId: string, livedDuration: string, memoryNote: string) => void;
  onAddCustomLog: (plantId: string, logTitle: string, logDesc: string, logType: CareLog['type']) => void;
  onBack: () => void;
}

export default function PlantDetailView({
  plant,
  onWater,
  onMoveToGraveyard,
  onAddCustomLog,
  onBack,
}: PlantDetailViewProps) {
  // Memorial dialog state
  const [showMemorialModal, setShowMemorialModal] = useState(false);
  const [livedDuration, setLivedDuration] = useState('1 Year, 2 Months');
  const [memoryNote, setMemoryNote] = useState('');

  // Custom log manual state
  const [logTitle, setLogTitle] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logType, setLogType] = useState<CareLog['type']>('note');
  const [showAddLog, setShowAddLog] = useState(false);

  // Filter calculated progress widths based on thirstLevel
  const wateringProgress = plant.status === 'dead' ? 0 : 100 - (plant.thirstLevel * 15);
  const fertilizerProgress = plant.status === 'dead' ? 0 : Math.max(10, 80 - plant.thirstLevel * 10);

  const handleArchive = (e: React.FormEvent) => {
    e.preventDefault();
    onMoveToGraveyard(plant.id, livedDuration || '1 Year', memoryNote || '"Always in our hearts."');
    setShowMemorialModal(false);
  };

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) return;
    onAddCustomLog(plant.id, logTitle, logDesc, logType);
    setLogTitle('');
    setLogDesc('');
    setShowAddLog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-24 pt-6"
    >
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#faf9f4]/90 backdrop-blur-md z-40 flex justify-between items-center px-6 border-b border-[#e3e3de]/40">
        <button
          onClick={onBack}
          className="text-[#424844] hover:bg-[#dee3b9]/25 transition-colors p-2 rounded-full cursor-pointer active:scale-90"
        >
          <span className="material-symbols-outlined font-semibold">arrow_back</span>
        </button>
        <h1 className="font-headline text-lg md:text-xl font-bold text-[#173124]">
          {plant.name}
        </h1>
        <button className="text-[#424844] hover:bg-[#dee3b9]/25 transition-colors p-2 rounded-full cursor-pointer">
          <span className="material-symbols-outlined font-semibold">more_vert</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="pt-8 flex flex-col gap-8 max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="w-full relative h-[300px] md:h-[420px] rounded-2xl overflow-hidden shadow-sm bg-[#efeee9]">
          <img
            src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=512'}
            alt={plant.species}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f4] via-[#faf9f4]/10 to-transparent"></div>

          {/* Floating care streak badge */}
          {plant.status === 'alive' && (
            <div className="absolute bottom-[-10px] right-6 z-10 scale-95 md:scale-100">
              <div className="bg-[#ffffff] border border-[#e3e3de] shadow-[0_8px_30px_rgba(45,71,57,0.08)] rounded-2xl p-4 flex items-center gap-3">
                <div className="bg-[#dee3b9] text-[#606644] rounded-full p-2.5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-[#727973] uppercase tracking-wider font-semibold leading-none">
                    Care Streak
                  </p>
                  <p className="font-headline text-lg md:text-xl text-[#173124] font-black mt-1">
                    {plant.streak} Days
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 items-start px-1">
          {/* Left Column: Needs & Primary Actions */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Quick tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#5c6140]/10 text-[#5c6140] font-sans text-xs font-semibold px-3 py-1 rounded-full">
                {plant.location}
              </span>
              {plant.tags.map((tag) => (
                <span
                  key={tag}
                  className={`font-sans text-xs font-semibold px-3 py-1 rounded-full ${
                    tag.toLowerCase().includes('toxic') || tag.toLowerCase().includes('sensitive')
                      ? 'bg-[#792414]/10 text-[#792414]'
                      : 'bg-[#173124]/10 text-[#173124]'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Quick Actions (only if alive) */}
            {plant.status === 'alive' ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onWater(plant.id)}
                  className="w-full bg-[#173124] text-[#ffffff] font-sans font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2d4739] transition-all shadow-sm cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-lg font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    water_drop
                  </span>
                  Mark as Watered
                </button>

                <button
                  onClick={() => setShowMemorialModal(true)}
                  className="w-full border border-[#c2c8c2] hover:bg-[#dee3b9]/20 text-[#727973] hover:text-[#173124] font-sans font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">deceased</span>
                  Move to Graveyard
                </button>
              </div>
            ) : (
              <div className="bg-[#792414]/5 border border-[#792414]/20 p-5 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#792414]">
                  <span className="material-symbols-outlined font-bold">deceased</span>
                  <span className="font-headline font-semibold text-sm">Memorialized Sprout</span>
                </div>
                <p className="font-sans text-xs text-[#727973] leading-relaxed">
                  Lived {plant.livedDuration || 'a beautiful life'} before joining the garden of remembrance.
                </p>
                {plant.memoryNote && (
                  <p className="font-sans text-xs text-[#5c6140] font-semibold italic bg-[#ffffff] p-3 rounded-xl border border-dashed border-[#c2c8c2] mt-2">
                    {plant.memoryNote}
                  </p>
                )}
              </div>
            )}

            {/* Care Schedules Card */}
            {plant.status === 'alive' && (
              <div className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                <h3 className="font-headline text-lg font-bold text-[#173124]">Care Needs</h3>

                <div className="flex flex-col gap-5">
                  {/* Watering bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-sans text-xs font-semibold text-[#1b1c19] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#173124] text-base font-bold">water_drop</span>
                        Watering
                      </span>
                      <span className="font-sans text-[11px] font-medium text-[#727973]">
                        {plant.thirstLevel >= 4 ? 'Every 2-3 days' : 'Every 7-10 days'}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#f5f4ef] rounded-full overflow-hidden border border-[#e3e3de]">
                      <div
                        className="h-full bg-[#173124] rounded-full transition-all duration-500"
                        style={{ width: `${wateringProgress}%` }}
                      ></div>
                    </div>
                    <p className="font-sans text-[10px] font-medium text-[#727973] mt-1 text-right italic">
                      {wateringProgress < 50 ? 'Needs water soon' : 'Soil is hydrated'}
                    </p>
                  </div>

                  {/* Fertilizer bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-sans text-xs font-semibold text-[#1b1c19] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#5c6140] text-base font-bold">science</span>
                        Fertilizer
                      </span>
                      <span className="font-sans text-[11px] font-medium text-[#727973]">
                        Monthly in Spring/Summer
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#f5f4ef] rounded-full overflow-hidden border border-[#e3e3de]">
                      <div
                        className="h-full bg-[#5c6140] rounded-full transition-all duration-500"
                        style={{ width: `${fertilizerProgress}%` }}
                      ></div>
                    </div>
                    <p className="font-sans text-[10px] font-medium text-[#727973] mt-1 text-right italic">
                      {fertilizerProgress < 40 ? 'Feeding due shortly' : 'Recently fertilized'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: History & Details */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* About Card */}
            <div className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl p-6 shadow-sm">
              <h3 className="font-headline text-lg font-bold text-[#173124] mb-3">
                About &ldquo;{plant.name}&rdquo;
              </h3>
              <p className="font-sans text-xs md:text-sm text-[#424844] font-medium leading-relaxed">
                {plant.about}
              </p>
              <div className="mt-4 pt-4 border-t border-[#f5f4ef] flex justify-between text-[11px] text-[#727973] font-medium font-sans">
                <span>Planted: {new Date(plant.createdAt).toLocaleDateString()}</span>
                <span>Type: {plant.species}</span>
              </div>
            </div>

            {/* Care History Timeline */}
            <div className="bg-[#ffffff] border border-[#e3e3de] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-lg font-bold text-[#173124]">Care History</h3>
                {plant.status === 'alive' && (
                  <button
                    onClick={() => setShowAddLog(!showAddLog)}
                    className="text-xs font-semibold text-[#173124] bg-[#dee3b9]/40 px-2.5 py-1 rounded-md hover:bg-[#dee3b9]/70 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                    {showAddLog ? 'Close' : 'Add Note'}
                  </button>
                )}
              </div>

              {/* Dynamic inline form for custom care notes */}
              {showAddLog && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  onSubmit={handleAddLogSubmit}
                  className="mb-6 p-4 bg-[#f5f4ef] rounded-xl border border-[#e3e3de] flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-xs font-semibold text-[#173124]">New Care Log Entry</span>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value as CareLog['type'])}
                      className="bg-[#ffffff] border border-[#c2c8c2] rounded px-2 py-0.5 text-[10px] font-sans font-medium text-[#173124] focus:outline-none"
                    >
                      <option value="note">Observation Note</option>
                      <option value="water">Water Activity</option>
                      <option value="fertilize">Fertilizing Activity</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Log title (e.g. Wiped the leaves with damp cloth)"
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    className="bg-[#ffffff] border border-[#c2c8c2] rounded-lg px-3 py-2 text-xs font-sans text-[#1b1c19] focus:outline-none focus:border-[#173124]"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Optional description/details..."
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    className="bg-[#ffffff] border border-[#c2c8c2] rounded-lg px-3 py-2 text-xs font-sans text-[#1b1c19] focus:outline-none focus:border-[#173124]"
                  />

                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLog(false)}
                      className="text-[11px] font-sans font-semibold text-[#727973] px-2.5 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-[11px] font-sans font-semibold bg-[#173124] text-[#ffffff] rounded px-3 py-1 hover:bg-[#2d4739] active:scale-95 transition-all cursor-pointer"
                    >
                      Add Log
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Timeline list */}
              {plant.careHistory && plant.careHistory.length > 0 ? (
                <div className="relative border-l-2 border-[#e3e3de] ml-3 space-y-6 pb-2">
                  {plant.careHistory.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      {/* Timeline dot icon based on action type */}
                      <div
                        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#ffffff] ${
                          log.type === 'water'
                            ? 'bg-[#173124]'
                            : log.type === 'fertilize'
                            ? 'bg-[#5c6140]'
                            : 'bg-[#c2c8c2]'
                        }`}
                      ></div>
                      <p className="font-sans text-[10px] text-[#727973] font-semibold leading-none mb-1">
                        {log.date}{log.time ? `, ${log.time}` : ''}
                      </p>
                      <p className="font-headline text-xs font-bold text-[#1b1c19]">
                        {log.title}
                      </p>
                      {log.description && (
                        <p className="font-sans text-xs text-[#424844] font-medium mt-1">
                          {log.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-xs text-[#727973] italic text-center py-4">
                  No logged care events found. Water your plant or add an observation note!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memorial overlay modal dialogue */}
      <AnimatePresence>
        {showMemorialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemorialModal(false)}
              className="absolute inset-0 bg-[#1b1c19]/40 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#ffffff] rounded-2xl border border-[#e3e3de] p-6 shadow-2xl z-10 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-headline text-lg font-bold text-[#792414] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">deceased</span>
                  Garden of Remembrance
                </h4>
                <button
                  onClick={() => setShowMemorialModal(false)}
                  className="text-[#727973] hover:text-[#1b1c19]"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <p className="font-sans text-xs text-[#424844] font-medium leading-relaxed">
                We are so sorry to hear about &ldquo;{plant.name}&rdquo;. Every gardener faces loss.
                Let's document their journey so we can remember them fondly and honor their growth.
              </p>

              <form onSubmit={handleArchive} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-[#173124]">
                    How long did they live in your care?
                  </label>
                  <input
                    type="text"
                    value={livedDuration}
                    onChange={(e) => setLivedDuration(e.target.value)}
                    placeholder="e.g. 1 Year, 3 Months"
                    className="bg-[#f5f4ef] border border-[#c2c8c2] focus:border-[#792414] rounded-lg px-3 py-2 text-xs font-sans text-[#1b1c19] focus:outline-none focus:ring-0"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-[#173124]">
                    Write an Epitaph / Memorial Quote
                  </label>
                  <textarea
                    value={memoryNote}
                    onChange={(e) => setMemoryNote(e.target.value)}
                    placeholder='e.g. "You fought bravely against the drafts, but the winter was too harsh."'
                    className="bg-[#f5f4ef] border border-[#c2c8c2] focus:border-[#792414] rounded-lg px-3 py-2 text-xs font-sans text-[#1b1c19] focus:outline-none min-h-[80px]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMemorialModal(false)}
                    className="text-xs font-sans font-semibold text-[#727973] px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#792414] text-[#ffffff] text-xs font-sans font-semibold px-4 py-2 rounded-full hover:bg-[#5a0d02] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm font-semibold">favorite</span>
                    Archive with Love
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
