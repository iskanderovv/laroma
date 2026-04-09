'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LeafletMouseEvent, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

interface MapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

export default function LocationMap({
  onLocationSelect,
  initialLat = 41.3111,
  initialLng = 69.2797,
  className = "w-full h-64 rounded-xl"
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [isLoading, setIsLoading] = useState(true);
  const initialPositionRef = useRef({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const mockAddress = `Toshkent shahar, ${Math.floor(lat * 1000) % 100}-ko'cha, ${Math.floor(lng * 1000) % 200}-uy`;
      onLocationSelectRef.current(lat, lng, mockAddress);
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelectRef.current(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        if (typeof window !== 'undefined') {
          const existing = document.querySelector<HTMLLinkElement>('link[data-leaflet="true"]');

          if (!existing) {
            await new Promise<void>((resolve) => {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
              link.dataset.leaflet = 'true';
              link.onload = () => resolve();
              link.onerror = () => resolve();
              document.head.appendChild(link);
            });
          } else if (!existing.sheet) {
            await new Promise<void>((resolve) => {
              const timer = window.setTimeout(() => resolve(), 600);
              existing.addEventListener('load', () => resolve(), { once: true });
              existing.addEventListener('error', () => resolve(), { once: true });
              existing.addEventListener('load', () => window.clearTimeout(timer), { once: true });
              existing.addEventListener('error', () => window.clearTimeout(timer), { once: true });
            });
          }
        }

        // Fix default markers
        const defaultIcon = L.Icon.Default.prototype as typeof L.Icon.Default.prototype & {
          _getIconUrl?: unknown;
        };
        delete defaultIcon._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (mapContainerRef.current && mounted) {
          const { lat, lng } = initialPositionRef.current;
          mapInstance.current = L.map(mapContainerRef.current).setView([lat, lng], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            detectRetina: true,
            maxZoom: 19,
          }).addTo(mapInstance.current);

          markerRef.current = L.marker([lat, lng], { draggable: true })
            .addTo(mapInstance.current);

          markerRef.current.on('dragend', () => {
            const selectedPoint = markerRef.current?.getLatLng();
            if (!selectedPoint) return;
            const { lat, lng } = selectedPoint;
            reverseGeocode(lat, lng);
          });

          mapInstance.current.on('click', (e: LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            markerRef.current?.setLatLng([lat, lng]);
            reverseGeocode(lat, lng);
          });

          reverseGeocode(lat, lng);

          requestAnimationFrame(() => {
            mapInstance.current?.invalidateSize();
          });

          setTimeout(() => {
            mapInstance.current?.invalidateSize();
          }, 150);
        }
      } catch (error) {
        console.error('Error loading map:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [reverseGeocode]);

  useEffect(() => {
    if (!mapInstance.current || !markerRef.current) {
      return;
    }

    markerRef.current.setLatLng([initialLat, initialLng]);
    mapInstance.current.setView([initialLat, initialLng], mapInstance.current.getZoom());
    mapInstance.current.invalidateSize();
  }, [initialLat, initialLng]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full rounded-xl" />

      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-600">Xarita yuklanmoqda...</p>
          </div>
        </div>
      )}
    </div>
  );
}
