'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { divIcon } from 'leaflet';
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2 } from 'lucide-react';
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
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  isSearching?: boolean;
}

// Component to handle map clicks
function LocationSelector({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function InteractiveMap({ 
  latitude, 
  longitude, 
  onLocationSelect,
  height = "500px",
  onSearch,
  searchQuery = "",
  onSearchQueryChange,
  isSearching = false
}: InteractiveMapProps) {
  const [center, setCenter] = useState<[number, number]>([41.2995, 69.2401]); // Default to Uzbekistan center

  const handleLocationSelect = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
              placeholder="Manzilni qidirish (ko'cha, shahar, uy)..."
              className="pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-base text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20"
            />
          </div>
          <Button 
            type="submit"
            disabled={isSearching}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-3 text-base font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Search size={20} />
                Qidirish
              </>
            )}
          </Button>
        </form>
      </div>
      
      <div className="flex-1 relative">
        <MapContainer 
          center={latitude && longitude ? [latitude, longitude] : center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationSelector onLocationSelect={handleLocationSelect} />
          {latitude !== null && longitude !== null && (
            <Marker 
              position={[latitude, longitude]} 
              icon={divIcon({
                html: `<div style="width: 40px; height: 40px; background-color: #ff0000; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 0 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
              })}
            />
          )}
        </MapContainer>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t dark:border-slate-700 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <MapPin size={16} className="text-red-500" />
          <span>
            {latitude !== null && longitude !== null 
              ? `Joylashuv tanlandi: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
              : 'Xaritadan manzilni belgilang'}
          </span>
        </div>
      </div>
    </Card>
  );
}