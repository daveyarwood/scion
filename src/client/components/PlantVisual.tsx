import React, { useEffect, useRef } from 'react';
import { GrowthStage } from '../../shared/index';
import { generatePlant, getSpritePath, selectAccentRamp, parseHexToRGB, getArchetype } from '../plant/generator';
import './PlantVisual.css';

interface PlantVisualProps {
  id: string;
  stage: GrowthStage;
}

export const PlantVisual: React.FC<PlantVisualProps> = ({ id, stage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plantData = generatePlant(id);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load sprite image
    const spritePath = new URL(`../plant/sprites/${getSpritePath(plantData.archetypeId, stage)}`, import.meta.url).href;

    const img = new Image();
    img.onload = () => {
      // Disable smoothing for pixel-perfect rendering
      ctx.imageSmoothingEnabled = false;

      // Draw sprite at 3x scale using the image's natural dimensions
      const scale = 3;
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;

      // Horizontally center, vertically bottom-align the sprite
      const x = (canvas.width - scaledWidth) / 2;
      const y = canvas.height - scaledHeight;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Palette ramp swap: remap accent pixels from source ramp to target ramp
      const archetype = getArchetype(plantData.archetypeId);
      const sourceRamp = archetype.accentRamp;
      const targetRamp = selectAccentRamp(id);

      // Only perform palette swap if source and target ramps differ
      if (sourceRamp !== targetRamp) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert source and target ramp hex colors to RGB
        const sourceRGB = sourceRamp.map(parseHexToRGB);
        const targetRGB = targetRamp.map(parseHexToRGB);

        // Map source RGB values to target RGB values
        const colorMap = new Map<number, { r: number; g: number; b: number }>();
        sourceRGB.forEach((rgb, index) => {
          // Create a key from RGB values to match against pixel data
          const key = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
          colorMap.set(key, targetRGB[index]);
        });

        // Iterate through pixels and remap accent colors
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip fully transparent pixels
          if (a === 0) continue;

          // Check if this pixel matches any source ramp color
          const key = (r << 16) | (g << 8) | b;
          const targetColor = colorMap.get(key);

          if (targetColor) {
            data[i] = targetColor.r;
            data[i + 1] = targetColor.g;
            data[i + 2] = targetColor.b;
            // Keep alpha unchanged
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }
    };

    img.onerror = () => {
      // Fallback: fill with a neutral color if sprite fails to load
      ctx.fillStyle = '#659939';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    img.src = spritePath;
  }, [stage, plantData.archetypeId, id]);

  return <canvas ref={canvasRef} className="plant-visual" width={128} height={192} />;
};
