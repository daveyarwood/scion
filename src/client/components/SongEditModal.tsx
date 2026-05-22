import React, { useState } from 'react';
import { Song, GrowthStage, UpdateSongWithId } from '../../shared/index';
import { getPromotedStage, getDemotedStage } from '../plant/stageTransitions';
import './SongEditModal.css';

interface SongEditModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateSongWithId) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export const SongEditModal: React.FC<SongEditModalProps> = ({
  song,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(song.title);
  const [body, setBody] = useState(song.body);
  const [growthStage, setGrowthStage] = useState<GrowthStage>(song.growth_stage);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updates: UpdateSongWithId = { id: song.id };
      if (title !== song.title) updates.title = title;
      if (body !== song.body) updates.body = body;
      if (growthStage !== song.growth_stage) updates.growth_stage = growthStage;
      await onSave(updates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      // First click: show confirmation
      setIsConfirmingDelete(true);
      return;
    }
    // Second click: execute delete
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsConfirmingDelete(false);
    }
  };

  // Helper function to get next/prev stages (excluding dormant and archived)
  const handlePromote = () => {
    const newStage = getPromotedStage(growthStage);
    if (newStage) {
      setGrowthStage(newStage);
    }
  };

  const handleDemote = () => {
    const newStage = getDemotedStage(growthStage);
    if (newStage) {
      setGrowthStage(newStage);
    }
  };

  const isInactive = growthStage === 'dormant' || growthStage === 'archived';
  const isAtMinStage = growthStage === 'seed' || isInactive;
  const isAtMaxPromotableStage = growthStage === 'blooming' || isInactive;

  const handleClose = () => {
    // Reset form to original values
    setTitle(song.title);
    setBody(song.body);
    setGrowthStage(song.growth_stage);
    setError(null);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>edit song</h2>
          <button className="modal-close-btn" onClick={handleClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label htmlFor="modal-title">title *</label>
            <input
              id="modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-body">notes</label>
            <textarea
              id="modal-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isLoading}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>growth stage</label>
            <div className="stage-controls">
              <button
                type="button"
                className="stage-btn stage-demote"
                onClick={handleDemote}
                disabled={isLoading || isAtMinStage}
                title="demote to earlier stage"
              >
                ◀
              </button>
              <span className="stage-label">{growthStage}</span>
              <button
                type="button"
                className="stage-btn stage-promote"
                onClick={handlePromote}
                disabled={isLoading || isAtMaxPromotableStage}
                title="promote to next stage"
              >
                ▶
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={isLoading || isConfirmingDelete}>
              {isLoading ? 'saving...' : 'save'}
            </button>
            {!isConfirmingDelete ? (
              <button
                type="button"
                className="btn btn-delete"
                onClick={handleDelete}
                disabled={isLoading}
              >
                delete
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  confirm delete
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isLoading}
                >
                  cancel
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
