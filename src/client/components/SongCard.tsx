import React, { useState } from 'react';
import { Song, GrowthStage } from '../../shared/index';
import { PlantVisual } from './PlantVisual';
import { formatDate } from './dateFormat';
import './SongCard.css';

interface SongCardProps {
  song: Song;
  onClick?: () => void;
  onStageChange?: (newStage: GrowthStage) => void;
  isLoadingStageChange?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onClick, 
  onStageChange,
  isLoadingStageChange = false 
}) => {
  const [pressing, setPressing] = useState(false);

  const promotableStages: GrowthStage[] = ['seed', 'seedling', 'sprout', 'budding', 'blooming'];

  const handlePromote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = promotableStages.indexOf(song.growth_stage);
    if (currentIndex >= 0 && currentIndex < promotableStages.length - 1) {
      const newStage = promotableStages[currentIndex + 1];
      onStageChange?.(newStage);
    }
  };

  const handleDemote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = promotableStages.indexOf(song.growth_stage);
    if (currentIndex > 0) {
      const newStage = promotableStages[currentIndex - 1];
      onStageChange?.(newStage);
    }
  };

  const isAtMinStage = song.growth_stage === 'seed';
  const isAtMaxPromotableStage = song.growth_stage === 'blooming';

  return (
    <div
      className={`song-card${pressing ? ' song-card--pressing' : ''}`}
      onClick={onClick}
      onMouseDown={(e) => { if (e.target === e.currentTarget) setPressing(true); }}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
    >
      <div className="song-card-header">
        <PlantVisual id={song.id} stage={song.growth_stage} />
        <div className="song-stage-controls">
          <button
            className="stage-btn-card stage-promote"
            onClick={handlePromote}
            disabled={isLoadingStageChange || isAtMaxPromotableStage}
            title="Promote to next stage"
            aria-label="Promote stage"
          >
            ▲
          </button>
          <span className="song-stage">{song.growth_stage}</span>
          <button
            className="stage-btn-card stage-demote"
            onClick={handleDemote}
            disabled={isLoadingStageChange || isAtMinStage}
            title="Demote to earlier stage"
            aria-label="Demote stage"
          >
            ▼
          </button>
        </div>
      </div>
      <h3 className="song-title">{song.title}</h3>
      {song.body && <p className="song-body">{song.body}</p>}
      <div className="song-footer">
        <span className="song-date">{formatDate(song.created_at)}</span>
      </div>
    </div>
  );
};
