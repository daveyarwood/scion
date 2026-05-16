import React, { useState } from 'react'
import { trpc } from './trpc'
import { SongGrid } from './components/SongGrid'
import { CreateSongForm } from './components/CreateSongForm'
import './App.css'

export const App: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)

  const listQuery = trpc.song.list.useQuery()
  const createMutation = trpc.song.create.useMutation({
    onSuccess: () => {
      listQuery.refetch()
      setShowCreateForm(false)
    },
  })

  const handleCreateSong = (title: string, body: string) => {
    createMutation.mutate({
      title,
      body: body || undefined,
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌱 Scion</h1>
        <p>A personal creative sketchbook for musical fragments</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ New Seed'}
          </button>
        </div>

        {showCreateForm && (
          <CreateSongForm
            onSubmit={handleCreateSong}
            isLoading={createMutation.isPending}
          />
        )}

        {listQuery.isLoading && <div className="loading">Loading songs...</div>}
        {listQuery.error && (
          <div className="error">Error loading songs: {listQuery.error.message}</div>
        )}
        {listQuery.data && <SongGrid songs={listQuery.data} />}
      </main>
    </div>
  )
}
