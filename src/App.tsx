/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plant, CareLog } from './types';
import { INITIAL_PLANTS } from './data';

import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import CollectionView from './components/CollectionView';
import GraveyardView from './components/GraveyardView';
import AddPlantView from './components/AddPlantView';
import PlantDetailView from './components/PlantDetailView';

const LOCAL_STORAGE_KEY = 'sprout_journal_plants';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'collection' | 'graveyard' | 'add'>('dashboard');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Initialize state from local storage or static seed
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        setPlants(JSON.parse(cached));
      } catch (err) {
        console.error('Failed to parse cached plants', err);
        setPlants(INITIAL_PLANTS);
      }
    } else {
      setPlants(INITIAL_PLANTS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
    }
  }, []);

  // Save plants to local storage whenever state changes
  const savePlants = (updatedPlants: Plant[]) => {
    setPlants(updatedPlants);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlants));
  };

  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // 1. Water Action
  const handleWater = (plantId: string) => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = getFormattedTime();

    const updated = plants.map((plant) => {
      if (plant.id === plantId && plant.status === 'alive') {
        const newLog: CareLog = {
          id: `log-${Date.now()}`,
          date: 'Today',
          time: timeStr,
          title: 'Watered thoroughly.',
          description: 'Soil was dry to touch.',
          type: 'water',
        };

        // Increment streak if not already watered today
        const lastWateredDate = new Date(plant.lastWatered).toDateString();
        const todayDate = new Date().toDateString();
        const isAlreadyWateredToday = lastWateredDate === todayDate;

        return {
          ...plant,
          lastWatered: new Date().toISOString(),
          streak: isAlreadyWateredToday ? plant.streak : plant.streak + 1,
          careHistory: [newLog, ...plant.careHistory],
        };
      }
      return plant;
    });

    savePlants(updated);
  };

  // 2. Memorial/Graveyard Action
  const handleMoveToGraveyard = (plantId: string, duration: string, note: string) => {
    const updated = plants.map((plant) => {
      if (plant.id === plantId) {
        const newLog: CareLog = {
          id: `log-${Date.now()}`,
          date: 'Today',
          time: getFormattedTime(),
          title: 'Moved to Graveyard.',
          description: `Remembered: ${note}`,
          type: 'system',
        };

        return {
          ...plant,
          status: 'dead' as const,
          livedDuration: duration,
          memoryNote: note,
          streak: 0,
          careHistory: [newLog, ...plant.careHistory],
        };
      }
      return plant;
    });

    savePlants(updated);
    setSelectedPlantId(null); // Close details view
    setActiveTab('graveyard'); // Redirect to graveyard immediately!
  };

  // 3. Add Custom Log Action
  const handleAddCustomLog = (
    plantId: string,
    title: string,
    desc: string,
    type: CareLog['type']
  ) => {
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const updated = plants.map((plant) => {
      if (plant.id === plantId) {
        const newLog: CareLog = {
          id: `log-${Date.now()}`,
          date: dateStr,
          time: getFormattedTime(),
          title,
          description: desc,
          type,
        };

        return {
          ...plant,
          careHistory: [newLog, ...plant.careHistory],
        };
      }
      return plant;
    });

    savePlants(updated);
  };

  // 4. Add New Sprout Action
  const handleAddNewPlant = (newPlant: Omit<Plant, 'id' | 'createdAt' | 'streak' | 'status' | 'lastWatered' | 'careHistory'>) => {
    const uniqueId = `plant-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const created: Plant = {
      ...newPlant,
      id: uniqueId,
      createdAt: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      streak: 1, // Fresh new start!
      status: 'alive',
      careHistory: [
        {
          id: `log-${Date.now()}`,
          date: dateStr,
          time: getFormattedTime(),
          title: `Welcomeed a New Sprout!`,
          description: `Successfully logged Sir ${newPlant.name} at the ${newPlant.location}. Let's keep them thriving.`,
          type: 'system',
        },
      ],
    };

    savePlants([created, ...plants]);
    setActiveTab('dashboard'); // Redirect to dashboard!
  };

  const handleSelectPlant = (plantId: string) => {
    setSelectedPlantId(plantId);
  };

  const handleBackToTab = () => {
    setSelectedPlantId(null);
  };

  const activePlant = plants.find((p) => p.id === selectedPlantId);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f4] text-[#1b1c19]">
      {/* Navigation Layer */}
      <Navigation
        currentTab={activeTab}
        setTab={(tab) => {
          setActiveTab(tab);
          setSelectedPlantId(null); // Clear selected plant detail on tab change
        }}
        onSearchToggle={() => setShowSearch(!showSearch)}
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      {/* Responsive adjustments: Left Margin is 16rem (w-64) on desktop to make space for the fixed sidebar */}
      <main className="flex-grow pt-24 pb-28 md:pb-12 px-6 max-w-5xl w-full mx-auto md:pl-72 transition-all">
        <AnimatePresence mode="wait">
          {selectedPlantId && activePlant ? (
            <PlantDetailView
              key={`detail-${selectedPlantId}`}
              plant={activePlant}
              onWater={handleWater}
              onMoveToGraveyard={handleMoveToGraveyard}
              onAddCustomLog={handleAddCustomLog}
              onBack={handleBackToTab}
            />
          ) : (
            <div className="w-full">
              {activeTab === 'dashboard' && (
                <DashboardView
                  key="dashboard"
                  plants={plants}
                  onWater={handleWater}
                  onSelectPlant={handleSelectPlant}
                  setTab={setActiveTab}
                />
              )}

              {activeTab === 'collection' && (
                <CollectionView
                  key="collection"
                  plants={plants}
                  onSelectPlant={handleSelectPlant}
                  setTab={setActiveTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}

              {activeTab === 'graveyard' && (
                <GraveyardView
                  key="graveyard"
                  plants={plants}
                  onSelectPlant={handleSelectPlant}
                />
              )}

              {activeTab === 'add' && (
                <AddPlantView
                  key="add"
                  onAddPlant={handleAddNewPlant}
                  onCancel={() => setActiveTab('dashboard')}
                />
              )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
