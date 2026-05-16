import React from 'react'
import { Song } from '../../shared/index'
import { SongCard } from './SongCard'
import './SongGrid.css'

interface SongGridProps {
  songs: Song[]
}

export const SongGrid: React.FC<SongGridProps> = ({ songs }) => {
  if (songs.length === 0) {
    return (
      <div className="empty-state">
        <p>No seeds yet. Create your first song idea to get started!</p>
      </div>
    )
  }

  return (
    <div className="song-grid">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  )
}
