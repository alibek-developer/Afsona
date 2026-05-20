'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { divIcon } from 'leaflet';
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Maximize2, Navigation } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  latitude: number | null;
  longitude: number | null;
  mapCenter?: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  isSearching?: boolean;
  isModalView?: boolean;
}

// Component to update map view when coordinates change
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  // Update map view when center changes
  map.setView(center, 17);
  
  return null;
}

// Component to handle map clicks with reverse geocoding
function LocationSelector({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address?: string) => void }) {
  const map = useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data?.display_name) {
            onLocationSelect(lat, lng, data.display_name);
            return;
          }
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }
      
      // Fallback - call without address
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

export function InteractiveMap({ 
  latitude, 
  longitude, 
  mapCenter,
  onLocationSelect,
  height = "500px",
  onSearch,
  searchQuery = "",
  onSearchQueryChange,
  isSearching = false,
  isModalView = false
}: InteractiveMapProps) {
  const [center, setCenter] = useState<[number, number]>([41.2995, 69.2401]); // Default to Uzbekistan center
  const [isMaximized, setIsMaximized] = useState(false);

  // Update local center when mapCenter prop changes
  useEffect(() => {
    if (mapCenter) {
      setCenter(mapCenter);
    }
  }, [mapCenter]);

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setCenter([lat, lng]);
    onLocationSelect(lat, lng, address);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleLocationSelect(lat, lng);
        },
        () => {
          alert("Joylashuvni aniqlab bo'lmadi");
        }
      );
    }
  };

  return (
    <div className="overflow-hidden h-full flex flex-col w-full">
      {/* Search Bar */}
      <div className="p-3 bg-[#111] border-b border-white/10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
              placeholder="Manzilni qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSearching ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Search size={16} />
                Qidirish
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="flex-1 relative w-full" style={{ minHeight: '150px' }}>
        <MapContainer 
          center={latitude && longitude ? [latitude, longitude] : center} 
          zoom={13} 
          style={{ height: '100%', width: '100%', minHeight: '150px' }}
          className="z-0"
          zoomControl={true}
          attributionControl={false}
        >
          <MapUpdater center={center} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationSelector onLocationSelect={handleLocationSelect} />
          {latitude !== null && longitude !== null && (
            <Marker 
              position={[latitude, longitude]} 
              draggable={true}
              eventHandlers={{
                dragend: async (e) => {
                  const marker = e.target;
                  if (marker != null) {
                    const position = marker.getLatLng();
                    const lat = position.lat;
                    const lng = position.lng;
                    
                    // Reverse geocoding to get address
                    try {
                      const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                      );
                      
                      if (response.ok) {
                        const data = await response.json();
                        if (data?.display_name) {
                          handleLocationSelect(lat, lng, data.display_name);
                          return;
                        }
                      }
                    } catch (error) {
                      console.error('Reverse geocoding error:', error);
                    }
                    
                    handleLocationSelect(lat, lng);
                  }
                }
              }}
              icon={divIcon({
                html: `<div style="width: 36px; height: 36px; background-color: #f59e0b; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 0 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
                className: '',
                iconSize: [36, 36],
                iconAnchor: [18, 36],
              })}
            />
          )}
        </MapContainer>

        {/* Floating Maximize Button */}
        {!isModalView && (
          <button
            type="button"
            onClick={() => setIsMaximized(true)}
            className="absolute bottom-3 right-3 z-[400] bg-[#111]/90 backdrop-blur-sm border border-white/10 text-zinc-200 p-2.5 rounded-xl hover:bg-[#111] hover:text-white transition flex items-center justify-center shadow-lg"
            title="Xaritani kengaytirish"
          >
            <Maximize2 size={16} className="text-red-500 animate-pulse" />
          </button>
        )}
      </div>
      
      <div className="p-2.5 bg-[#111] border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <MapPin size={14} className="text-amber-500" />
          <span className="truncate max-w-[90%]">
            {latitude !== null && longitude !== null 
              ? `Joylashuv tanlandi: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
              : 'Xaritadan manzilni belgilang'}
          </span>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {!isModalView && (
        <Dialog open={isMaximized} onOpenChange={setIsMaximized}>
          <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-[80vw] h-[80vh] bg-[#0c0c0c] border border-white/10 p-0 flex flex-col overflow-hidden rounded-3xl z-[9999] shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#111]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <MapPin className="text-red-500 w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-zinc-100 uppercase tracking-wider">
                    Manzilni aniqlash
                  </DialogTitle>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Xaritadan kerakli nuqtani yoki mijoz manzilini tanlang. Markerni sudrash orqali ham manzilni o'zgartirishingiz mumkin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMaximized(false)}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-red-500/20"
              >
                Tasdiqlash
              </button>
            </div>

            {/* Modal Map Area */}
            <div className="flex-1 relative w-full h-full bg-[#111]">
              <InteractiveMap
                latitude={latitude}
                longitude={longitude}
                mapCenter={mapCenter}
                onLocationSelect={onLocationSelect}
                height="100%"
                onSearch={onSearch}
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                isSearching={isSearching}
                isModalView={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}