import React from 'react';
import { Song, GrowthStage } from '../../shared/index';
import { SongCard } from './SongCard';
import './SongGrid.css';

interface SongGridProps {
  songs: Song[];
  onSongClick?: (song: Song) => void;
  onSongStageChange?: (song: Song, newStage: GrowthStage) => void;
  isLoadingStageChange?: boolean;
}

export const SongGrid: React.FC<SongGridProps> = ({ 
  songs, 
  onSongClick, 
  onSongStageChange,
  isLoadingStageChange = false 
}) => {
  if (songs.length === 0) {
    return (
      <div className="empty-state">
        <p>No seeds yet. Create your first song idea to get started!</p>
      </div>
    );
  }

  return (
    <div className="song-grid">
      {songs.map((song) => (
        <SongCard 
          key={song.id} 
          song={song} 
          onClick={() => onSongClick?.(song)}
          onStageChange={(newStage) => onSongStageChange?.(song, newStage)}
          isLoadingStageChange={isLoadingStageChange}
        />
      ))}
    </div>
  );
};
