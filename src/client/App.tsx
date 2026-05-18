import React, { useState } from 'react';
import { Song, UpdateSongWithId, GrowthStage } from '../shared/index';
import { trpc } from './trpc';
import { SongGrid } from './components/SongGrid';
import { CreateSongForm } from './components/CreateSongForm';
import { SongEditModal } from './components/SongEditModal';
import './App.css';

export const App: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

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
      setSelectedSong(null);
    },
  });
  const deleteMutation = trpc.song.delete.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      setSelectedSong(null);
    },
  });

  const handleCreateSong = (title: string, body: string) => {
    createMutation.mutate({
      title,
      body: body || undefined,
    });
  };

  const handleSaveEditedSong = async (data: UpdateSongWithId) => {
    return new Promise<void>((resolve, reject) => {
      updateMutation.mutate(data, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleDeleteSong = async () => {
    if (!selectedSong) return;
    return new Promise<void>((resolve, reject) => {
      deleteMutation.mutate(selectedSong.id, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
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
            {showCreateForm ? 'Cancel' : '+ New Seed'}
          </button>
        </div>

        {showCreateForm && (
          <CreateSongForm onSubmit={handleCreateSong} isLoading={createMutation.isPending} />
        )}

        {listQuery.isLoading && <div className="loading">Loading songs...</div>}
        {listQuery.error && (
          <div className="error">Error loading songs: {listQuery.error.message}</div>
        )}
        {listQuery.data && (
          <SongGrid 
            songs={listQuery.data} 
            onSongClick={(song) => setSelectedSong(song)}
            onSongStageChange={handleSongStageChange}
            isLoadingStageChange={updateMutation.isPending}
          />
        )}
      </main>

      {selectedSong && (
        <SongEditModal
          song={selectedSong}
          isOpen={true}
          onClose={() => setSelectedSong(null)}
          onSave={handleSaveEditedSong}
          onDelete={handleDeleteSong}
          isLoading={updateMutation.isPending || deleteMutation.isPending}
        />
      )}
    </div>
  );
};
