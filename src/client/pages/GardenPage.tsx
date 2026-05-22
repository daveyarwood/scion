import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Song, GrowthStage } from '../../shared/index';
import { trpc } from '../trpc';
import { SongGrid } from '../components/SongGrid';
import { CreateSongForm } from '../components/CreateSongForm';

export const GardenPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const listQuery = trpc.song.list.useQuery();
  const createMutation = trpc.song.create.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      setShowCreateForm(false);
    },
  });
  const updateMutation = trpc.song.update.useMutation({
    onSuccess: () => {
      listQuery.refetch();
    },
  });

  const handleCreateSong = (title: string, body: string) => {
    createMutation.mutate({
      title,
      body: body || undefined,
    });
  };

  const handleSongClick = (song: Song) => {
    navigate(`/songs/${song.id}`);
  };

  const handleSongStageChange = (song: Song, newStage: GrowthStage) => {
    updateMutation.mutate({
      id: song.id,
      growth_stage: newStage,
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌱 Scion</h1>
        <p>A personal creative sketchbook for musical fragments</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'cancel' : '+ new seed'}
          </button>
        </div>

        {showCreateForm && (
          <CreateSongForm onSubmit={handleCreateSong} isLoading={createMutation.isPending} />
        )}

        {listQuery.isLoading && <div className="loading">loading songs...</div>}
        {listQuery.error && (
          <div className="error">Error loading songs: {listQuery.error.message}</div>
        )}
        {listQuery.data && (
          <SongGrid 
            songs={listQuery.data} 
            onSongClick={handleSongClick}
            onSongStageChange={handleSongStageChange}
            isLoadingStageChange={updateMutation.isPending}
          />
        )}
      </main>
    </div>
  );
};
