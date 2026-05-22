import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UpdateSongWithId, GrowthStage } from '../../shared/index';
import { trpc } from '../trpc';
import { getPromotedStage, getDemotedStage } from '../plant/stageTransitions';
import { PlantVisual } from '../components/PlantVisual';
import '../components/SongEditModal.css'; // Reuse modal styles
import './SongEditPage.css';

export const SongEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Initialize queries before any conditional returns
  const songQuery = trpc.song.get.useQuery(id || '', { enabled: !!id });
  const updateMutation = trpc.song.update.useMutation({
    onSuccess: () => {
      songQuery.refetch();
    },
  });
  const deleteMutation = trpc.song.delete.useMutation({
    onSuccess: () => {
      navigate('/');
    },
  });

  // Initialize state before any conditional returns
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('seed');
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form state from song data when query succeeds
  React.useEffect(() => {
    if (songQuery.data && !initialized) {
      const song = songQuery.data;
      setTitle(song.title);
      setBody(song.body);
      setGrowthStage(song.growth_stage);
      setInitialized(true);
    }
  }, [songQuery.data, initialized]);

  // Check for invalid ID after hooks
  if (!id) {
    return <div>Invalid song ID</div>;
  }

  if (songQuery.isLoading) {
    return <div className="loading">loading song...</div>;
  }

  if (songQuery.error || !songQuery.data) {
    return <div className="error">error loading song: {songQuery.error?.message || 'song not found'}</div>;
  }

  const song = songQuery.data;
  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updates: UpdateSongWithId = { id: song.id };
      if (title !== song.title) updates.title = title;
      if (body !== song.body) updates.body = body;
      if (growthStage !== song.growth_stage) updates.growth_stage = growthStage;
      
      await new Promise<void>((resolve, reject) => {
        updateMutation.mutate(updates, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save');
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
      await new Promise<void>((resolve, reject) => {
        deleteMutation.mutate({ id: song.id }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to delete');
      setIsConfirmingDelete(false);
    }
  };

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

  return (
    <div className="song-edit-page">
      <header className="app-header">
        <h1>🌱 Scion</h1>
        <p>a personal creative sketchbook for musical fragments</p>
      </header>

      <main className="song-edit-main">
        <div className="song-edit-container">
          <div className="song-edit-visual">
            <PlantVisual id={song.id} stage={growthStage} archetype={song.archetype} accentRamp={song.accent_ramp} />
          </div>

          <div className="song-edit-form-container">
            {error && <div className="modal-error">{error}</div>}

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label htmlFor="song-edit-title">title *</label>
                <input
                  id="song-edit-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="song-edit-body">notes</label>
                <textarea
                  id="song-edit-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={isLoading}
                  rows={8}
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
                  onClick={() => navigate('/')}
                  disabled={isLoading}
                >
                  back
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
