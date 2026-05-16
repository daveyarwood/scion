import React from 'react'
import { Song } from '../../shared/index'
import './SongCard.css'

interface SongCardProps {
  song: Song
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const getStageEmoji = (stage: string): string => {
    const emojiMap: Record<string, string> = {
      seed: '🌰',
      seedling: '🌱',
      sprout: '🌿',
      blooming: '🌸',
      dormant: '❄️',
      archived: '📦',
    }
    return emojiMap[stage] || '🌱'
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="song-card">
      <div className="song-card-header">
        <span className="song-stage-emoji">{getStageEmoji(song.growth_stage)}</span>
        <span className="song-stage">{song.growth_stage}</span>
      </div>
      <h3 className="song-title">{song.title}</h3>
      {song.body && <p className="song-body">{song.body}</p>}
      <div className="song-footer">
        <span className="song-date">{formatDate(song.created_at)}</span>
      </div>
    </div>
  )
}
