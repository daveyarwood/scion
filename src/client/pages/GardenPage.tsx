import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Song, GrowthStage, GrowthStageEnum } from '../../shared/index';
import { trpc } from '../trpc';
import { SongGrid } from '../components/SongGrid';
import './GardenPage.css';

export const GardenPage: React.FC = () => {
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<GrowthStage | null>(null);
  const navigate = useNavigate();

  const listQuery = trpc.song.list.useQuery(undefined, { staleTime: 0 });
  const createMutation = trpc.song.create.useMutation({
    onSuccess: (newSong) => {
      navigate(`/songs/${newSong.id}`);
    },
  });
  const updateMutation = trpc.song.update.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      setLoadingSongId(null);
    },
    onError: () => {
      setLoadingSongId(null);
    },
  });

  const handleNewSeed = () => {
    createMutation.mutate({});
  };

  const handleSongClick = (song: Song) => {
    navigate(`/songs/${song.id}`);
  };

  const handleSongStageChange = (song: Song, newStage: GrowthStage) => {
    setLoadingSongId(song.id);
    updateMutation.mutate({
      id: song.id,
      growth_stage: newStage,
    });
  };

  const handleStageChipClick = (stage: GrowthStage) => {
    setFilterStage(filterStage === stage ? null : stage);
  };

  const songs = listQuery.data ?? [];
  const filteredSongs =
    filterStage === null ? songs : songs.filter((s) => s.growth_stage === filterStage);

  return (
    <div className="app">
      <header className="app-header">
        <h1>scion</h1>
        <p>where song ideas grow</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={handleNewSeed}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'planting...' : '+ new seed'}
          </button>
        </div>

        <div className="stage-chips">
          {GrowthStageEnum.options.map((stage) => (
            <button
              key={stage}
              className={`stage-chip${filterStage === stage ? ' stage-chip--active' : ''}`}
              onClick={() => handleStageChipClick(stage)}
            >
              {stage}
            </button>
          ))}
        </div>

        {listQuery.isLoading && <div className="loading">loading songs...</div>}
        {listQuery.error && (
          <div className="error">error loading songs: {listQuery.error.message}</div>
        )}
        {listQuery.data && (
          <>
            {songs.length > 0 && filteredSongs.length === 0 ? (
              <div className="no-results">no songs match your filters</div>
            ) : (
              <SongGrid
                songs={filteredSongs}
                onSongClick={handleSongClick}
                onSongStageChange={handleSongStageChange}
                loadingSongId={loadingSongId}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
