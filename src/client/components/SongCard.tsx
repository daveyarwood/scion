import React, { useState } from 'react'
import { Song, GrowthStage } from '../../shared/index'
import { PlantVisual } from './PlantVisual'
import { formatDate } from './dateFormat'
import { getPromotedStage, getDemotedStage } from '../plant/stageTransitions'
import './SongCard.css'

interface SongCardProps {
  song: Song
  onClick?: () => void
  onStageChange?: (newStage: GrowthStage) => void
  isLoadingStageChange?: boolean
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  onClick,
  onStageChange,
  isLoadingStageChange = false,
}) => {
  const [pressing, setPressing] = useState(false)

  const handlePromote = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStage = getPromotedStage(song.growth_stage)
    if (newStage) {
      onStageChange?.(newStage)
    }
  }

  const handleDemote = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStage = getDemotedStage(song.growth_stage)
    if (newStage) {
      onStageChange?.(newStage)
    }
  }

  const isInactive = song.growth_stage === 'dormant' || song.growth_stage === 'archived'
  const isAtMinStage = song.growth_stage === 'seed' || isInactive
  const isAtMaxPromotableStage = song.growth_stage === 'blooming' || isInactive

  return (
    <div
      className={`song-card${pressing ? ' song-card--pressing' : ''}`}
      onClick={onClick}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setPressing(true)
      }}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
    >
      <div className="song-card-header">
        <PlantVisual
          id={song.id}
          stage={song.growth_stage}
          archetype={song.archetype}
          accentRamp={song.accent_ramp}
        />
        <div className="song-stage-controls">
          <button
            className="stage-btn-card stage-promote"
            onClick={handlePromote}
            disabled={isLoadingStageChange || isAtMaxPromotableStage}
            title="promote to next stage"
            aria-label="promote stage"
          >
            ▲
          </button>
          <span className="song-stage">{song.growth_stage}</span>
          <button
            className="stage-btn-card stage-demote"
            onClick={handleDemote}
            disabled={isLoadingStageChange || isAtMinStage}
            title="demote to earlier stage"
            aria-label="demote stage"
          >
            ▼
          </button>
        </div>
      </div>
      <h3 className="song-title">{song.title}</h3>
      {song.body && <p className="song-body">{song.body}</p>}
      <div className="song-footer">
        <span className="song-date">{formatDate(song.updated_at)}</span>
      </div>
    </div>
  )
}
