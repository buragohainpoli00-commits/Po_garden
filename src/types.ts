/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CareLog {
  id: string;
  date: string; // e.g., "Today", "Oct 12, 2023", "2026-07-14"
  time?: string; // e.g., "9:00 AM"
  title: string; // e.g., "Watered thoroughly."
  description?: string; // e.g., "Soil was dry to touch."
  type: 'water' | 'fertilize' | 'note' | 'system';
}

export interface Plant {
  id: string;
  name: string; // Nickname, e.g., "Monty"
  species: string; // e.g., "Monstera Deliciosa"
  imageUrl?: string;
  imageFile?: string; // data URI from upload, fallback if custom uploaded
  thirstLevel: number; // 1 to 5 (1 = Cactus/Desert, 3 = Every 1-2 weeks, 5 = Swamp)
  difficulty: 'easy' | 'medium' | 'hard'; // Chill & Forgiving, Needs Routine, Drama Queen
  streak: number; // Days thriving
  location: string; // e.g., "Living Room", "Office Desk"
  about: string; // Quick note or description
  tags: string[]; // e.g., ["Bright Indirect Light", "Toxic to Pets"]
  status: 'alive' | 'dead';
  lastWatered: string; // ISO date string or date representation
  createdAt: string; // When planted
  careHistory: CareLog[];
  
  // Dead plant fields
  livedDuration?: string; // e.g., "2 Years, 3 Months"
  memoryNote?: string; // e.g., "Remembered Fondly..."
}
