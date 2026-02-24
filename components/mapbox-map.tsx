'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox access token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface DeliveryAddress {
  lat?: number | null;
  lng?: number | null;
  type?: string;
}

interface CourierLocation {
  lat?: number | null;
  lng?: number | null;
}

interface MapboxMapProps {
  lat?: number | null
  lng?: number | null
  zoom?: number
  className?: string
  deliveryAddress?: DeliveryAddress;
  courierLocation?: CourierLocation;
  status?: string;
}

export function MapboxMap({ lat, lng, zoom = 13, className, deliveryAddress, courierLocation, status }: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const deliveryMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const courierMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const polylineRef = useRef<mapboxgl.AnyLayer | null>(null)

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

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Wait for map to load
    map.on('load', () => {
      // Add delivery marker if delivery address exists and order type is delivery
      if (deliveryAddress?.lat && deliveryAddress?.lng && deliveryAddress.type === 'delivery') {
        const deliveryMarkerEl = document.createElement('div')
        deliveryMarkerEl.style.width = '32px'
        deliveryMarkerEl.style.height = '32px'
        deliveryMarkerEl.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ff0000\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\'/%3E%3C/svg%3E")'
        deliveryMarkerEl.style.backgroundSize = 'contain'
        deliveryMarkerEl.style.backgroundRepeat = 'no-repeat'
        deliveryMarkerEl.style.backgroundPosition = 'center'
        deliveryMarkerEl.style.cursor = 'pointer'

        const deliveryMarker = new mapboxgl.Marker({ element: deliveryMarkerEl })
          .setLngLat([deliveryAddress.lng, deliveryAddress.lat])
          .addTo(map)
        deliveryMarkerRef.current = deliveryMarker
      }

      // Add courier marker if courier location exists and status is on_the_way or yo'lda
      if (courierLocation?.lat && courierLocation?.lng && (status === 'on_the_way' || status === 'yo\'lda')) {
        const courierMarkerEl = document.createElement('div')
        courierMarkerEl.style.width = '32px'
        courierMarkerEl.style.height = '32px'
        courierMarkerEl.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%230000ff\'%3E%3Cpath d=\'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z\'/%3E%3C/svg%3E")'
        courierMarkerEl.style.backgroundSize = 'contain'
        courierMarkerEl.style.backgroundRepeat = 'no-repeat'
        courierMarkerEl.style.backgroundPosition = 'center'
        courierMarkerEl.style.cursor = 'pointer'

        const courierMarker = new mapboxgl.Marker({ element: courierMarkerEl })
          .setLngLat([courierLocation.lng, courierLocation.lat])
          .addTo(map)
        courierMarkerRef.current = courierMarker
      }

      // Draw polyline if both courier and delivery locations exist
      if (courierLocation?.lat && courierLocation?.lng && deliveryAddress?.lat && deliveryAddress?.lng && (status === 'on_the_way' || status === 'yo\'lda')) {
        const routeSource: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [courierLocation.lng, courierLocation.lat],
                [deliveryAddress.lng, deliveryAddress.lat]
              ]
            }
          }]
        };

        // Add source for the route
        map.addSource('route', {
          type: 'geojson',
          data: routeSource
        });

        // Add layer for the route
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff0000',
            'line-width': 4,
            'line-dasharray': [2, 2] // Dashed line
          }
        });
      }
    })

    // Cleanup on unmount
    return () => {
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.remove()
      }
      if (courierMarkerRef.current) {
        courierMarkerRef.current.remove()
      }
      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, []) // Only run once on mount

  // Update markers and polyline when coordinates change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Update delivery marker
    if (deliveryAddress?.lat && deliveryAddress?.lng && deliveryAddress.type === 'delivery') {
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setLngLat([deliveryAddress.lng, deliveryAddress.lat])
      } else {
        const deliveryMarkerEl = document.createElement('div')
        deliveryMarkerEl.style.width = '32px'
        deliveryMarkerEl.style.height = '32px'
        deliveryMarkerEl.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ff0000\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\'/%3E%3C/svg%3E")'
        deliveryMarkerEl.style.backgroundSize = 'contain'
        deliveryMarkerEl.style.backgroundRepeat = 'no-repeat'
        deliveryMarkerEl.style.backgroundPosition = 'center'
        deliveryMarkerEl.style.cursor = 'pointer'

        deliveryMarkerRef.current = new mapboxgl.Marker({ element: deliveryMarkerEl })
          .setLngLat([deliveryAddress.lng, deliveryAddress.lat])
          .addTo(map)
      }
    } else if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.remove()
      deliveryMarkerRef.current = null
    }

    // Update courier marker
    if (courierLocation?.lat && courierLocation?.lng && (status === 'on_the_way' || status === 'yo\'lda')) {
      if (courierMarkerRef.current) {
        // Animate courier marker movement smoothly
        const currentPos = courierMarkerRef.current.getLngLat()
        const targetPos = new mapboxgl.LngLat(courierLocation.lng!, courierLocation.lat!)
        
        // Create animation effect
        const startTime = Date.now()
        const duration = 1000 // Animation duration in ms
        
        const animateMarker = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // Linear interpolation between current and target positions
          const animatedLng = currentPos.lng + (targetPos.lng - currentPos.lng) * progress
          const animatedLat = currentPos.lat + (targetPos.lat - currentPos.lat) * progress
          
          courierMarkerRef.current!.setLngLat([animatedLng, animatedLat])
          
          if (progress < 1) {
            requestAnimationFrame(animateMarker)
          } else {
            // Set final position
            courierMarkerRef.current!.setLngLat(targetPos)
          }
        }
        
        animateMarker()
      } else {
        const courierMarkerEl = document.createElement('div')
        courierMarkerEl.style.width = '32px'
        courierMarkerEl.style.height = '32px'
        courierMarkerEl.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%230000ff\'%3E%3Cpath d=\'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z\'/%3E%3C/svg%3E")'
        courierMarkerEl.style.backgroundSize = 'contain'
        courierMarkerEl.style.backgroundRepeat = 'no-repeat'
        courierMarkerEl.style.backgroundPosition = 'center'
        courierMarkerEl.style.cursor = 'pointer'

        courierMarkerRef.current = new mapboxgl.Marker({ element: courierMarkerEl })
          .setLngLat([courierLocation.lng, courierLocation.lat])
          .addTo(map)
      }
    } else if (courierMarkerRef.current) {
      courierMarkerRef.current.remove()
      courierMarkerRef.current = null
    }

    // Update polyline
    if (map.getSource('route') && courierLocation?.lat && courierLocation?.lng && deliveryAddress?.lat && deliveryAddress?.lng && (status === 'on_the_way' || status === 'yo\'lda')) {
      const routeSource: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [courierLocation.lng, courierLocation.lat],
              [deliveryAddress.lng, deliveryAddress.lat]
            ]
          }
        }]
      };

      (map.getSource('route') as mapboxgl.GeoJSONSource).setData(routeSource);
    } else if (map.getSource('route') && (status !== 'on_the_way' && status !== 'yo\'lda' || !courierLocation?.lat || !deliveryAddress?.lat)) {
      // Remove polyline if not in 'yo'lda status or locations are missing
      map.removeLayer('route');
      map.removeSource('route');
    }

    // Fit map to both markers when courier appears
    if (courierLocation?.lat && courierLocation?.lng && deliveryAddress?.lat && deliveryAddress?.lng && (status === 'on_the_way' || status === 'yo\'lda')) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend([deliveryAddress.lng, deliveryAddress.lat])
        .extend([courierLocation.lng, courierLocation.lat])
      
      // Add some padding around the bounds
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      })
    } else if (courierLocation?.lat && courierLocation?.lng && (status === 'on_the_way' || status === 'yo\'lda')) {
      // Center on courier if delivery coordinates are null
      map.flyTo({
        center: [courierLocation.lng, courierLocation.lat],
        zoom: 13,
        duration: 1000
      })
    } else if (deliveryAddress?.lat && deliveryAddress?.lng) {
      // Just center on delivery location if courier is not present
      map.flyTo({
        center: [deliveryAddress.lng, deliveryAddress.lat],
        zoom: 13,
        duration: 1000
      })
    }
  }, [deliveryAddress, courierLocation, status])

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}