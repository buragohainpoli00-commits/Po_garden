/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plant, CareLog } from '../types';
import CameraCapture from './CameraCapture';

interface AddPlantViewProps {
  key?: React.Key;
  onAddPlant: (plant: Omit<Plant, 'id' | 'createdAt' | 'streak' | 'status' | 'lastWatered' | 'careHistory'>) => void;
  onCancel: () => void;
}

const PRESET_BOTANICAL_IMAGES = [
  {
    name: 'Monstera',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASAxs0DDWrz9ZNYV5xzP0BTKaRPrHhCohAj4vGqJBKWc4t6uEtgooFInHVrFD_WXYsDkPb4QjyNTDkSpjKxu3-S3CkED8mizyL2KGYT13ICyx05Qtnwq4p5Es6Cszf_02wi-dFELUz4-EwYYaEZixDXvl7LCg_RVUxp3KyRmD7FNTMwfl9tFgqbsBoqvF0Ax2_TmfqpEfmNDFHaUhL_wVvXOuTJF5dSnjBtK5O44lOqH0vB8ZFY1hE',
  },
  {
    name: 'Pothos',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0H75nk--sL-omGzmKDT-iluOPzvM2gA88htxH1B3eCp7APGx81egeiZMWie7RCAqOwd_kHj3uWo33yxvKmN1uWNud1OngFpSDRnhcS7xdInXxufyVs85620m4BDPGNdedAQoU3Ddnr2by8pNNa8HVs69cflnaqVv5UGoxnP_NSmbQRMiaDJBmGkpCbrqRt_-QzH7urbpK9ouQgFFyUkg2i-Sd_PRO2vAaDx8CJT0O5YtdSPe5ADI8',
  },
  {
    name: 'Fiddle Fig',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2lAiAJU-eCHOTQGJnFCP3FG93bfUBINQVjDDfbTlNsl2gKJSnA4llPkkyC0x0o7svCvk4NjKH0JidOt6cSQdo_z6uAiMTm6CVCpu7atQzYUJv-8CLeiSnI1pMB71B0G_hrUzYLQFMYxXE8IoGgajfJ5uHTKp-7fl_wSC6DIqtRJWxfsddCRcf_Q2756ws9WCE1S-Fjzs-zIbZnEdv5NetC2pKi_U4AWDSZqvSX4irfEFUg2yu7XRL',
  },
  {
    name: 'Snake Plant',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_DCJ-InFwhqd1rTLr9FMHrg3z3M5Z3RWHRLEtPBUeNR9DIjWuFb5o9J1FS91JY4LxW7KGJBIBInrZExQ6P_U2XNALUfBW6P2cxweFAdDC-j-t3dHUVQaMxosEzjnBA0pDekQLdWJQXjNssRKCo8KXknka0DSWHbuP3jsBn45TBYhoxPL4SAQQDl5R9IFSZitsa3ecCx-sLWXfFjP-mRVYfh9WeS8aNzB30sDlAEI0DziBlcuK5kxl',
  },
  {
    name: 'Aloe Vera',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARHj5oajzjv1Goxyxfvj0fux4KqMH9erZjxyUAUE5ZQxdi7dBNVWSddXTvlGaxe2bThK144-5scNa_Ok2uiFI1NXl2Ey8xUIK8qhWYNscngkz9f1OqQwCKivcGGGM0PtY3QCKmBmSF6Jthtp3nbYggwehJ8W3mdV70kfcuepNQoASzfTd_89Q77tLWxWJqcXc6GhlUIp3ncIF-bwQxuT2E21tQH9rHs7PAfS7KZh57KLXywnlfMF7e',
  },
];

const WATER_TEXTS: Record<string, string> = {
  '1': 'Barely ever (Cactus)',
  '2': 'When completely dry',
  '3': 'Every 1-2 weeks',
  '4': 'Keep soil moist',
  '5': 'Constant humidity',
};

export default function AddPlantView({ onAddPlant, onCancel }: AddPlantViewProps) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('Living Room');
  const [about, setAbout] = useState('');
  const [thirstLevel, setThirstLevel] = useState(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [imageOption, setImageOption] = useState<'upload' | 'preset'>('preset');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(PRESET_BOTANICAL_IMAGES[0].url);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState('');

  // VisionAI states
  const [showCamera, setShowCamera] = useState(false);
  const [identifying, setIdentifying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reusable VisionAI scanner function
  const runVisionAIScan = async (base64Image: string) => {
    setIdentifying(true);
    setFormError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/identify-plant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to identify plant.');
      }

      const data = await response.json();
      if (data.name) setName(data.name);
      if (data.species) setSpecies(data.species);
      if (data.thirstLevel) setThirstLevel(Number(data.thirstLevel));
      if (data.difficulty) setDifficulty(data.difficulty as 'easy' | 'medium' | 'hard');
      if (data.about) setAbout(data.about);

    } catch (err: any) {
      console.error('VisionAI Scan Error:', err);
      setFormError(`VisionAI Scan failed: ${err.message || 'Make sure your backend proxy server is running.'}`);
    } finally {
      setIdentifying(false);
    }
  };

  // Permanently re-encode any uploaded image through an HTML canvas to a
  // clean image/png data URL. This eliminates corrupt JPEG blobs, HEIC files,
  // and any format the Anthropic API refuses to accept.
  const normalizeImageToCleanPNG = (rawDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Limit max dimension to 1200px to keep payload small
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) {
              height = Math.round((height / width) * MAX);
              width = MAX;
            } else {
              width = Math.round((width / height) * MAX);
              height = MAX;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image could not be loaded for re-encoding'));
      img.src = rawDataUrl;
    });
  };

  // File reading support for base64 uploading
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.');
      return;
    }
    setFormError('');
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        try {
          // Re-encode through canvas → guaranteed clean PNG before anything else
          const cleanPNG = await normalizeImageToCleanPNG(e.target.result);
          setUploadedBase64(cleanPNG);
          setImageOption('upload');
          runVisionAIScan(cleanPNG);
        } catch {
          setFormError('Could not process that image. Please try a different file.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = async (base64Image: string) => {
    setShowCamera(false);
    try {
      const cleanPNG = await normalizeImageToCleanPNG(base64Image);
      setUploadedBase64(cleanPNG);
      setImageOption('upload');
      runVisionAIScan(cleanPNG);
    } catch {
      setFormError('Could not process the camera snapshot. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please provide a plant name or nickname.');
      return;
    }

    setFormError('');

    const finalImageUrl = imageOption === 'upload' && uploadedBase64 
      ? uploadedBase64 
      : selectedPresetUrl;

    const tags: string[] = [];
    if (thirstLevel === 1) tags.push('Desert Loving');
    else if (thirstLevel >= 4) tags.push('Moisture Loving');
    else tags.push('Bright Indirect Light');

    if (difficulty === 'easy') tags.push('Chill & Forgiving');
    if (difficulty === 'hard') tags.push('Toxic to Pets');

    onAddPlant({
      name,
      species: species || 'Unknown Houseplant',
      location,
      about: about || `A beloved member of our plant family, resting in the ${location}.`,
      thirstLevel,
      difficulty,
      imageUrl: finalImageUrl,
      tags,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto flex flex-col gap-8 pb-10"
    >
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold text-[#173124] mb-2">Welcome a New Sprout</h2>
        <p className="font-sans text-sm text-[#424844]">Let's get this little one documented so it can thrive.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#ffffff] p-6 md:p-8 rounded-2xl border border-[#e3e3de] shadow-[0_4px_25px_rgba(45,71,57,0.02)] flex flex-col gap-6"
      >
        {/* Error notice */}
        {formError && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#ba1a1a] rounded-xl px-4 py-2.5 text-xs font-sans font-semibold">
            {formError}
          </div>
        )}

        {/* VisionAI Scan Trigger Card */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={identifying}
            onClick={() => setShowCamera(true)}
            className="w-full py-3 bg-[#dee3b9]/30 hover:bg-[#dee3b9]/50 disabled:opacity-50 text-[#173124] border border-[#173124]/30 rounded-xl font-sans text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 duration-700"
          >
            <span className="material-symbols-outlined text-base">photo_camera</span>
            Scan Sprout with VisionAI
          </button>
        </div>

        {/* 1. Photo Block */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-semibold text-[#173124] uppercase tracking-wider">
            Plant Portrait
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            {/* Left box: Main preview & Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !identifying && fileInputRef.current?.click()}
              className={`sm:col-span-2 relative h-[280px] w-full rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#173124] bg-[#dee3b9]/20' 
                  : 'border-[#c2c8c2] bg-[#f5f4ef] hover:bg-[#e3e3de]/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={identifying}
              />

              {/* Dynamic Loading Overlay */}
              {identifying && (
                <div className="absolute inset-0 bg-[#1b1c19]/80 flex flex-col items-center justify-center text-[#ffffff] p-4 text-center z-20">
                  <span className="animate-spin material-symbols-outlined text-3xl text-[#dee3b9] mb-2">cached</span>
                  <span className="font-sans text-xs font-bold">Claude is identifying...</span>
                  <span className="font-sans text-[10px] text-stone-400 mt-1 max-w-[200px]">Analyzing leaves, thirst index, and care guidelines</span>
                </div>
              )}

              {imageOption === 'upload' && uploadedBase64 ? (
                <>
                  <img
                    src={uploadedBase64}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#1b1c19]/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[#ffffff] font-sans text-xs font-semibold z-10">
                    <span className="material-symbols-outlined text-lg mr-1">photo_camera</span>
                    Change Photo
                  </div>
                </>
              ) : imageOption === 'preset' ? (
                <>
                  <img
                    src={selectedPresetUrl}
                    alt="Preset preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#1b1c19]/20 flex items-center justify-center z-10">
                    <span className="bg-[#ffffff]/90 text-[#173124] font-sans text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      Tap to Upload Custom
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <span className="material-symbols-outlined text-4xl text-[#727973] mb-2">photo_camera</span>
                  <span className="font-sans text-xs text-[#173124] font-semibold">Tap to capture its good side</span>
                  <span className="font-sans text-[10px] text-[#727973] mt-0.5">Drag and drop file here</span>
                </div>
              )}
            </div>

            {/* Right side: Presets chooser */}
            <div className="sm:col-span-1 flex flex-col gap-2">
              <span className="font-sans text-[10px] text-[#727973] font-semibold uppercase tracking-wider">
                Preset Library
              </span>
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                {PRESET_BOTANICAL_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    disabled={identifying}
                    onClick={() => {
                      setSelectedPresetUrl(preset.url);
                      setImageOption('preset');
                    }}
                    className={`flex-1 shrink-0 p-1.5 rounded-xl border flex items-center gap-2 transition-colors cursor-pointer text-left ${
                      imageOption === 'preset' && selectedPresetUrl === preset.url
                        ? 'border-[#173124] bg-[#dee3b9]/20'
                        : 'border-[#e3e3de] hover:bg-[#efeee9]'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-8 h-8 rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-sans text-[11px] font-semibold text-[#173124] whitespace-nowrap">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Form Details */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-semibold text-[#173124]" htmlFor="plant-name">
              Plant Name or Nickname
            </label>
            <input
              id="plant-name"
              type="text"
              placeholder="e.g. Sir Reginald or Monty"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#c2c8c2] focus:border-[#173124] font-sans text-sm text-[#1b1c19] py-2 focus:outline-none transition-colors placeholder:text-[#727973]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-[#173124]" htmlFor="plant-species">
                Species / Type (Optional)
              </label>
              <input
                id="plant-species"
                type="text"
                placeholder="What kind of plant is it? (e.g., Monstera Deliciosa)"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#c2c8c2] focus:border-[#173124] font-sans text-sm text-[#1b1c19] py-2 focus:outline-none transition-colors placeholder:text-[#727973]"
              />
            </div>

            <div className="flex flex-col gap-1.5 justify-end">
              <label className="font-sans text-xs font-semibold text-[#173124]" htmlFor="plant-location">
                Placement / Location
              </label>
              <select
                id="plant-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#f5f4ef] border border-[#c2c8c2] focus:border-[#173124] rounded-lg px-2.5 py-[10px] font-sans text-xs text-[#1b1c19] focus:outline-none"
              >
                <option value="Living Room">Living Room</option>
                <option value="Bedroom Window">Bedroom Window</option>
                <option value="Office Desk">Office Desk</option>
                <option value="Kitchen Shelves">Kitchen Shelves</option>
                <option value="Hallway">Hallway</option>
                <option value="Balcony">Balcony</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-semibold text-[#173124]" htmlFor="plant-desc">
              Bio Description
            </label>
            <textarea
              id="plant-desc"
              rows={3}
              placeholder="A short story or notes..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full bg-[#f5f4ef] border border-[#c2c8c2] focus:border-[#173124] rounded-lg px-3 py-2 font-sans text-sm text-[#1b1c19] focus:outline-none resize-none transition-colors placeholder:text-[#727973] min-h-[80px]"
            />
          </div>
        </div>

        {/* 3. Watering Frequency Slider */}
        <div className="flex flex-col gap-3 p-4 bg-[#f5f4ef] rounded-xl border border-[#e3e3de]">
          <div className="flex justify-between items-center">
            <label className="font-sans text-xs font-semibold text-[#173124] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm font-semibold text-[#173124]">water_drop</span>
              Thirst Level
            </label>
            <span className="font-sans text-[11px] font-semibold text-[#606644] bg-[#dee3b9]/50 px-2.5 py-1 rounded-full border border-[#dee3b9]">
              {WATER_TEXTS[thirstLevel.toString()]}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            value={thirstLevel}
            onChange={(e) => setThirstLevel(Number(e.target.value))}
            className="w-full appearance-none bg-transparent cursor-pointer py-1"
          />

          <div className="flex justify-between w-full font-sans text-[10px] text-[#727973] px-1 font-medium">
            <span>Desert</span>
            <span>Swamp</span>
          </div>
        </div>

        {/* 4. Maintenance Level Chips */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-xs font-semibold text-[#173124] uppercase tracking-wider">
            Maintenance Level
          </label>
          <div className="flex flex-wrap gap-2.5">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={difficulty === 'easy'}
                onChange={() => setDifficulty('easy')}
                className="peer sr-only"
              />
              <div className="px-4 py-2 rounded-full border border-[#5c6140] bg-[#ffffff] text-[#5c6140] peer-checked:bg-[#dee3b9] peer-checked:text-[#606644] peer-checked:border-[#dee3b9] transition-all font-sans text-xs font-semibold">
                Chill & Forgiving
              </div>
            </label>

            <label className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value="medium"
                checked={difficulty === 'medium'}
                onChange={() => setDifficulty('medium')}
                className="peer sr-only"
              />
              <div className="px-4 py-2 rounded-full border border-[#5c6140] bg-[#ffffff] text-[#5c6140] peer-checked:bg-[#dee3b9] peer-checked:text-[#606644] peer-checked:border-[#dee3b9] transition-all font-sans text-xs font-semibold">
                Needs Routine
              </div>
            </label>

            <label className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={difficulty === 'hard'}
                onChange={() => setDifficulty('hard')}
                className="peer sr-only"
              />
              <div className="px-4 py-2 rounded-full border border-[#5a0d02] bg-[#ffffff] text-[#5a0d02] peer-checked:bg-[#792414] peer-checked:text-[#ff8f78] peer-checked:border-[#792414] transition-all font-sans text-xs font-semibold">
                Drama Queen
              </div>
            </label>
          </div>
        </div>

        {/* Form Footer Action Buttons */}
        <div className="pt-4 border-t border-[#e3e3de] flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 font-sans text-xs font-semibold text-[#5c6140] bg-transparent border border-[#5c6140] rounded-full hover:bg-[#dee3b9]/25 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 font-sans text-xs font-semibold text-[#ffffff] bg-[#173124] rounded-full hover:bg-[#173124]/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 duration-100"
          >
            <span className="material-symbols-outlined text-sm font-semibold">yard</span>
            Plant It
          </button>
        </div>
      </form>

      {/* Camera Capture Modal Panel */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
