import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GardenPage } from './pages/GardenPage'
import { SongEditPage } from './pages/SongEditPage'
import './App.css'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GardenPage />} />
        <Route path="/songs/:id" element={<SongEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
