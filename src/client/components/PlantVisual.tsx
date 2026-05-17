import React from 'react';
import { GrowthStage } from '../../shared/index';
import { generatePlant } from '../plant/generator';
import './PlantVisual.css';

interface PlantVisualProps {
  id: string;
  stage: GrowthStage;
}

export const PlantVisual: React.FC<PlantVisualProps> = ({ id, stage }) => {
  const plant = generatePlant(id, stage);

  // SVG dimensions
  const width = 120;
  const height = 140;
  const centerX = width / 2;
  const baseY = height - 10;

  // Generate SVG path for curved stem
  const stemPath = `M ${centerX} ${baseY} Q ${centerX + plant.stemCurve} ${baseY - plant.stemHeight * 0.5} ${centerX + plant.stemCurve * 0.5} ${baseY - plant.stemHeight}`;

  // Generate leaf SVG paths
  const leaves = plant.leafAngles.map((angle, index) => {
    // Position leaf along the stem (higher up for higher index)
    const progress = (index + 1) / Math.max(plant.leafCount, 1);
    const leafBaseX = centerX + plant.stemCurve * (1 - progress);
    const leafBaseY = baseY - plant.stemHeight * progress;

    // Angle in radians
    const angleRad = (angle * Math.PI) / 180;
    const leafLength = 20 + plant.complexity * 3;

    // Leaf tip position
    const leafTipX = leafBaseX + Math.cos(angleRad) * leafLength;
    const leafTipY = leafBaseY + Math.sin(angleRad) * leafLength;

    // Create leaf shape (simple curved oval)
    const leafPath = `M ${leafBaseX} ${leafBaseY} Q ${leafBaseX + Math.cos(angleRad) * leafLength * 0.7} ${leafBaseY + Math.sin(angleRad) * leafLength * 0.5 - 5} ${leafTipX} ${leafTipY}`;

    return (
      <path
        key={`leaf-${index}`}
        d={leafPath}
        stroke={plant.hue}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    );
  });

  // Render based on stage
  if (stage === 'seed') {
    // Just a small seed form
    return (
      <svg className="plant-visual" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <ellipse cx={centerX} cy={baseY} rx="8" ry="10" fill={plant.hue} opacity="0.7" />
      </svg>
    );
  }

  if (stage === 'archived') {
    // Sparse, faded plant
    return (
      <svg
        className="plant-visual plant-archived"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <path d={stemPath} stroke={plant.hue} strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
        {leaves.map((leaf) => React.cloneElement(leaf, { opacity: 0.3 }))}
      </svg>
    );
  }

  if (stage === 'dormant') {
    // Drooping stem
    const droopStem = `M ${centerX} ${baseY} Q ${centerX + plant.stemCurve * 1.5} ${baseY - plant.stemHeight * 0.3} ${centerX + plant.stemCurve} ${baseY + 10}`;
    return (
      <svg className="plant-visual" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={droopStem} stroke={plant.hue} strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
        {leaves.slice(0, 1).map((leaf) => leaf)}
      </svg>
    );
  }

  // Normal plants (seedling, sprout, blooming)
  const svgContent = (
    <>
      {/* Stem */}
      <path d={stemPath} stroke={plant.hue} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Leaves */}
      {leaves}

      {/* Flower (for blooming stage) */}
      {stage === 'blooming' && (
        <>
          <circle cx={centerX + plant.stemCurve * 0.3} cy={baseY - plant.stemHeight - 5} r="6" fill={plant.hue} opacity="0.8" />
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const petalX = centerX + plant.stemCurve * 0.3 + Math.cos(rad) * 8;
            const petalY = baseY - plant.stemHeight - 5 + Math.sin(rad) * 8;
            return (
              <ellipse
                key={`petal-${angle}`}
                cx={petalX}
                cy={petalY}
                rx="3"
                ry="5"
                fill={plant.hue}
                opacity="0.7"
                transform={`rotate(${angle} ${petalX} ${petalY})`}
              />
            );
          })}
        </>
      )}
    </>
  );

  return (
    <svg className="plant-visual" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {svgContent}
    </svg>
  );
};
