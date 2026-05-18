import React, { useEffect, useRef } from 'react';
import { GrowthStage } from '../../shared/index';
import { generatePlant, getSpritePath } from '../plant/generator';
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

      // Draw sprite at 4x scale (36px sprite → 144px display)
      const scale = 4;
      const scaledWidth = 36 * scale;
      const scaledHeight = 36 * scale;

      // Center the sprite on canvas
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // TODO: palette ramp swap
      // Each archetype should declare an `accentRamp` — an ordered list of source
      // shades used for flowers/fruit in the sprite (shadow → highlight). At render
      // time, the UUID deterministically selects a target Gardener palette ramp and
      // each source shade is remapped to the corresponding target shade positionally.
      //
      // This requires palette-constrained sprites (exact indexed colors, no
      // anti-aliasing) produced via Aseprite. The current placeholder sprites use
      // hundreds of anti-aliased colors so no single-color swap is meaningful.
      // Implement once real archetype sprites are available.
    };

    img.onerror = () => {
      // Fallback: fill with a neutral color if sprite fails to load
      ctx.fillStyle = '#659939';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    img.src = spritePath;
  }, [stage, plantData.archetypeId]);

  return <canvas ref={canvasRef} className="plant-visual" width={180} height={180} />;
};
