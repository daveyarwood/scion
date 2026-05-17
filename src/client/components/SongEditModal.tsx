import React, { useState } from 'react';
import { Song, GrowthStage, UpdateSongWithId } from '../../shared/index';
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
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleClose = () => {
    // Reset form to original values
    setTitle(song.title);
    setBody(song.body);
    setGrowthStage(song.growth_stage);
    setError(null);
    onClose();
  };

  const stages: GrowthStage[] = ['seed', 'seedling', 'sprout', 'blooming', 'dormant', 'archived'];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Song</h2>
          <button className="modal-close-btn" onClick={handleClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label htmlFor="modal-title">Title *</label>
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
            <label htmlFor="modal-body">Notes</label>
            <textarea
              id="modal-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isLoading}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-stage">Growth Stage</label>
            <select
              id="modal-stage"
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
              disabled={isLoading}
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-delete"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
            <button type="button" className="btn btn-cancel" onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
