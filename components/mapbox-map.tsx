'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox access token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface MapboxMapProps {
  lat?: number | null
  lng?: number | null
  zoom?: number
  className?: string
}

export function MapboxMap({ lat, lng, zoom = 13, className }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Default center (Shovot)
  const defaultCenter: [number, number] = [60.3465, 41.6558]
  const center: [number, number] = lat && lng ? [lng, lat] : defaultCenter

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/alibek20997/cmlrwkqiq002001sdg7qz1oyh',
      center: center,
      zoom: zoom,
    })

    mapRef.current = map

    // Create custom red marker element
    const markerEl = document.createElement('div')
    markerEl.style.width = '24px'
    markerEl.style.height = '24px'
    markerEl.style.backgroundColor = '#FF0000'
    markerEl.style.borderRadius = '50%'
    markerEl.style.border = '3px solid white'
    markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    markerEl.style.cursor = 'pointer'

    // Add marker if coordinates exist
    if (lat && lng) {
      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .addTo(map)
      markerRef.current = marker
    }

    // Cleanup on unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, []) // Only run once on mount

  // Update marker position when coordinates change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (lat && lng) {
      const newLngLat: [number, number] = [lng, lat]

      if (markerRef.current) {
        // Update existing marker position
        markerRef.current.setLngLat(newLngLat)
      } else {
        // Create new marker
        const markerEl = document.createElement('div')
        markerEl.style.width = '24px'
        markerEl.style.height = '24px'
        markerEl.style.backgroundColor = '#FF0000'
        markerEl.style.borderRadius = '50%'
        markerEl.style.border = '3px solid white'
        markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        markerEl.style.cursor = 'pointer'

        markerRef.current = new mapboxgl.Marker({ element: markerEl })
          .setLngLat(newLngLat)
          .addTo(map)
      }

      // Smoothly pan to new position
      map.easeTo({
        center: newLngLat,
        duration: 1000,
      })
    }
  }, [lat, lng])

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
