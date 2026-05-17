import React from 'react';
import { Song } from '../../shared/index';
import { PlantVisual } from './PlantVisual';
import './SongCard.css';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="song-card">
      <div className="song-card-header">
        <PlantVisual id={song.id} stage={song.growth_stage} />
        <span className="song-stage">{song.growth_stage}</span>
      </div>
      <h3 className="song-title">{song.title}</h3>
      {song.body && <p className="song-body">{song.body}</p>}
      <div className="song-footer">
        <span className="song-date">{formatDate(song.created_at)}</span>
      </div>
    </div>
  );
};
