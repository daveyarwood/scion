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

  const utils = trpc.useUtils();

  // Initialize queries before any conditional returns
  const songQuery = trpc.song.get.useQuery(id || '', { enabled: !!id, staleTime: 0 });
  const updateMutation = trpc.song.update.useMutation({
    onSuccess: (updatedSong) => {
      songQuery.refetch();
      // Update the list cache so the garden page is correct immediately on back navigation
      utils.song.list.setData(undefined, (prev) =>
        prev?.map((s) => (s.id === updatedSong.id ? updatedSong : s))
      );
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
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form from server data unless the user has unsaved edits.
  // isDirty is reset on id change and after a successful save.
  React.useEffect(() => {
    setIsDirty(false);
  }, [id]);

  React.useEffect(() => {
    if (songQuery.data && !songQuery.isFetching && !isDirty) {
      const song = songQuery.data;
      setTitle(song.title);
      setBody(song.body);
      setGrowthStage(song.growth_stage);
    }
  }, [songQuery.data, songQuery.isFetching, isDirty]);

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
          onSuccess: () => {
            setSaved(true);
            setIsDirty(false);
            setTimeout(() => setSaved(false), 2000);
            resolve();
          },
          onError: (error) => reject(error),
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to save');
    }
  };

  const handleDelete = async () => {
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

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handlePromote = () => {
    const newStage = getPromotedStage(growthStage);
    if (newStage) {
      setGrowthStage(newStage);
      setIsDirty(true);
    }
  };

  const handleDemote = () => {
    const newStage = getDemotedStage(growthStage);
    if (newStage) {
      setGrowthStage(newStage);
      setIsDirty(true);
    }
  };

  const isInactive = growthStage === 'dormant' || growthStage === 'archived';
  const isAtMinStage = growthStage === 'seed' || isInactive;
  const isAtMaxPromotableStage = growthStage === 'blooming' || isInactive;

  return (
    <div className="song-edit-page">
      <header className="app-header">
        <h1>scion</h1>
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
                  onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="song-edit-body">notes</label>
                <textarea
                  id="song-edit-body"
                  value={body}
                  onChange={(e) => { setBody(e.target.value); setIsDirty(true); }}
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
                {isConfirmingDelete && (
                  <div className="delete-confirm-prompt">
                    <span>delete this song?</span>
                    <button
                      type="button"
                      className="delete-confirm-yes"
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      yes, delete
                    </button>
                    <button
                      type="button"
                      className="delete-confirm-no"
                      onClick={() => setIsConfirmingDelete(false)}
                      disabled={isLoading}
                    >
                      cancel
                    </button>
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-save" disabled={isLoading}>
                  {isLoading ? 'saving...' : saved ? 'saved ✓' : 'save'}
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                >
                  delete
                </button>
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
