/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Plant } from '../types';

interface GraveyardViewProps {
  key?: React.Key;
  plants: Plant[];
  onSelectPlant?: (plantId: string) => void;
}

export default function GraveyardView({ plants, onSelectPlant }: GraveyardViewProps) {
  // Filter dead plants
  const deadPlants = plants.filter((p) => p.status === 'dead');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-10"
    >
      {/* Header Section */}
      <section className="text-center max-w-2xl mx-auto mb-2">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#173124] mb-3">
          My Garden
        </h2>
        <p className="font-sans text-sm md:text-base text-[#424844] font-medium leading-relaxed">
          A vibrant space celebrating every plant that has been part of our journey. From thriving greens to cherished past favorites, every leaf tells a story of growth and care.
        </p>
      </section>

      {/* Graveyard Cards Gallery */}
      {deadPlants.length === 0 ? (
        <div className="bg-[#ffffff] border border-[#c2c8c2] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
          <span className="material-symbols-outlined text-4xl text-[#727973]">emoji_nature</span>
          <p className="font-headline text-base font-semibold text-[#173124]">All your sprouts are thriving!</p>
          <p className="font-sans text-xs text-[#727973]">
            There are no deceased sprouts in the memorial yet. Keep up the amazing care!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deadPlants.map((plant) => (
            <motion.article
              key={plant.id}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onSelectPlant?.(plant.id)}
              className="bg-[#ffffff] rounded-2xl overflow-hidden border border-[#e3e3de] flex flex-col shadow-[0_4px_20px_rgba(45,71,57,0.03)] cursor-pointer hover:shadow-[0_8px_30px_rgba(45,71,57,0.06)] group transition-all"
            >
              {/* grayscaled image block */}
              <div className="h-48 relative overflow-hidden bg-[#efeee9] grayscale hover:grayscale-0 transition-all duration-500">
                <img
                  src={plant.imageUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=256'}
                  alt={plant.name}
                  className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-[#ffffff]/20 to-transparent"></div>
              </div>

              {/* details block */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#173124]">
                      {plant.name}
                    </h3>
                    <p className="font-sans text-xs text-[#727973] italic">{plant.species}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#c2c8c2] group-hover:text-[#5c6140] transition-colors">
                    deceased
                  </span>
                </div>

                <p className="font-sans text-[10px] text-[#5c6140] font-bold uppercase tracking-widest leading-none">
                  Lived: {plant.livedDuration || 'Unknown Duration'}
                </p>

                {/* memory note quote box */}
                <div className="bg-[#5c6140]/5 p-4 rounded-xl border border-dashed border-[#c2c8c2] mt-auto">
                  <p className="font-sans text-xs text-[#424844] italic text-center leading-relaxed">
                    {plant.memoryNote || '"Gone but not forgotten."'}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
