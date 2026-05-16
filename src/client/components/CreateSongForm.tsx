import React, { useState } from 'react'
import './CreateSongForm.css'

interface CreateSongFormProps {
  onSubmit: (title: string, body: string) => void
  isLoading?: boolean
}

export const CreateSongForm: React.FC<CreateSongFormProps> = ({ onSubmit, isLoading = false }) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit(title, body)
      setTitle('')
      setBody('')
    }
  }

  return (
    <form className="create-song-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          placeholder="Song title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="body">Notes (optional)</label>
        <textarea
          id="body"
          placeholder="Initial ideas, lyrics, mood..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isLoading}
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading || !title.trim()}
      >
        {isLoading ? 'Creating...' : 'Create Seed'}
      </button>
    </form>
  )
}
