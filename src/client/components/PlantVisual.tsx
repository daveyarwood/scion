import React, { useEffect, useRef } from 'react'
import { GrowthStage } from '../../shared/index'
import {
  generatePlant,
  getSpritePath,
  selectAccentRamp,
  parseHexToRGB,
  getArchetype,
} from '../plant/generator'
import './PlantVisual.css'

interface PlantVisualProps {
  id: string
  stage: GrowthStage
  archetype?: string | null
  accentRamp?: string | null
}

export const PlantVisual: React.FC<PlantVisualProps> = ({
  id,
  stage,
  archetype: storedArchetype,
  accentRamp: storedAccentRamp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Use stored values if available, otherwise derive from UUID
  const plantData = storedArchetype
    ? { archetypeId: getArchetypeIdByName(storedArchetype) }
    : generatePlant(id)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas immediately
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load sprite image
    const spritePath = new URL(
      `../plant/sprites/${getSpritePath(plantData.archetypeId, stage)}`,
      import.meta.url
    ).href

    const img = new Image()
    let cancelled = false

    img.onload = () => {
      if (cancelled) return

      // Disable smoothing for pixel-perfect rendering
      ctx.imageSmoothingEnabled = false

      // Draw sprite at 3x scale using the image's natural dimensions
      const scale = 3
      const scaledWidth = img.naturalWidth * scale
      const scaledHeight = img.naturalHeight * scale

      // Horizontally center, vertically bottom-align the sprite
      const x = (canvas.width - scaledWidth) / 2
      const y = canvas.height - scaledHeight

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

      // Palette ramp swap: remap accent pixels from source ramp to target ramp
      const archetype = getArchetype(plantData.archetypeId)
      const sourceRamp = archetype.accentRamp

      // Use stored accent ramp if available, otherwise derive from UUID
      let targetRamp: [string, string, string, string]
      if (storedAccentRamp) {
        try {
          targetRamp = JSON.parse(storedAccentRamp)
        } catch {
          // If JSON parsing fails, fall back to UUID-derived
          targetRamp = selectAccentRamp(id)
        }
      } else {
        targetRamp = selectAccentRamp(id)
      }

      // Only perform palette swap if source and target ramps differ
      const rampsAreDifferent = JSON.stringify(sourceRamp) !== JSON.stringify(targetRamp)
      if (rampsAreDifferent) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Convert source and target ramp hex colors to RGB
        const sourceRGB = sourceRamp.map(parseHexToRGB)
        const targetRGB = targetRamp.map(parseHexToRGB)

        // Map source RGB values to target RGB values
        const colorMap = new Map<number, { r: number; g: number; b: number }>()
        sourceRGB.forEach((rgb, index) => {
          // Create a key from RGB values to match against pixel data
          const key = (rgb.r << 16) | (rgb.g << 8) | rgb.b
          colorMap.set(key, targetRGB[index])
        })

        // Iterate through pixels and remap accent colors
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          // Skip fully transparent pixels
          if (a === 0) continue

          // Check if this pixel matches any source ramp color
          const key = (r << 16) | (g << 8) | b
          const targetColor = colorMap.get(key)

          if (targetColor) {
            data[i] = targetColor.r
            data[i + 1] = targetColor.g
            data[i + 2] = targetColor.b
            // Keep alpha unchanged
          }
        }

        ctx.putImageData(imageData, 0, 0)
      }
    }

    img.onerror = () => {
      if (cancelled) return
      // Fallback: fill with a neutral color if sprite fails to load
      ctx.fillStyle = '#659939'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    img.src = spritePath

    return () => {
      cancelled = true
    }
  }, [stage, plantData.archetypeId, id, storedArchetype, storedAccentRamp])

  return <canvas ref={canvasRef} className="plant-visual" width={128} height={192} />
}

/**
 * Convert archetype name to ID.
 * Maps: 'tulip' → 0, 'hibiscus' → 1, 'cactus' → 2, 'mushroom' → 3
 */
const getArchetypeIdByName = (name: string): number => {
  const nameMap: Record<string, number> = {
    tulip: 0,
    hibiscus: 1,
    cactus: 2,
    mushroom: 3,
  }
  return nameMap[name] ?? 0
}
