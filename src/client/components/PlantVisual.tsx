import React, { useEffect, useRef } from 'react';
import { GrowthStage } from '../../shared/index';
import { generatePlant, getArchetype, parseHexToRGB } from '../plant/generator';
import './PlantVisual.css';

interface PlantVisualProps {
  id: string;
  stage: GrowthStage;
}

export const PlantVisual: React.FC<PlantVisualProps> = ({ id, stage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plantData = generatePlant(id, stage);
  const archetype = getArchetype(plantData.archetypeId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load sprite image
    const spriteFilename = archetype.spriteStages[stage];
    const spritePath = new URL(`../plant/sprites/${spriteFilename}`, import.meta.url).href;

    const img = new Image();
    img.onload = () => {
      // Disable smoothing for pixel-perfect rendering
      ctx.imageSmoothingEnabled = false;

      // Draw sprite at 4x scale (36px sprite → 144px display)
      const scale = 4;
      const scaledWidth = 36 * scale;
      const scaledHeight = 36 * scale;

      // Center the sprite on canvas
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Apply palette swap: replace #c54c86 with accent color
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert accent color from hex to RGB
      const accentColor = plantData.accentColor;
      const accentRGB = parseHexToRGB(accentColor);

      // Replace #c54c86 (197, 76, 134) with accent color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Match #c54c86 exactly (197, 76, 134)
        if (r === 197 && g === 76 && b === 134 && a === 255) {
          data[i] = accentRGB.r;
          data[i + 1] = accentRGB.g;
          data[i + 2] = accentRGB.b;
          // Keep alpha unchanged
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    img.onerror = () => {
      // Fallback if sprite fails to load
      ctx.fillStyle = plantData.accentColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    img.src = spritePath;
  }, [stage, plantData, archetype]);

  return <canvas ref={canvasRef} className="plant-visual" width={180} height={180} />;
};
