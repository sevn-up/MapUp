"use client";

import { useEffect, useRef, useState } from "react";

interface StreetViewPanoProps {
  lat: number;
  lng: number;
  className?: string;
  onNoCoverage?: () => void;
}

/**
 * Google Street View panorama embed using the JS API.
 * Uses StreetViewService to find the nearest available panorama
 * within a search radius, handling locations without coverage.
 */
export function StreetViewPano({ lat, lng, className, onNoCoverage }: StreetViewPanoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const serviceRef = useRef<google.maps.StreetViewService | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [noCoverage, setNoCoverage] = useState(false);
  const [error, setError] = useState(false);

  // Load Google Maps JS API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError(true);
      return;
    }

    if (window.google?.maps?.StreetViewPanorama) {
      setApiLoaded(true);
      return;
    }

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      // Script already in DOM, wait for it
      if (window.google?.maps) {
        setApiLoaded(true);
      } else {
        existing.addEventListener("load", () => setApiLoaded(true));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => setApiLoaded(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, []);

  // Find nearest panorama and display it
  useEffect(() => {
    if (!apiLoaded || !containerRef.current) return;

    setNoCoverage(false);

    if (!serviceRef.current) {
      serviceRef.current = new google.maps.StreetViewService();
    }

    // Search for the nearest panorama within 5km radius
    serviceRef.current.getPanorama(
      {
        location: { lat, lng },
        radius: 50000, // 50km search radius — city center coords may be far from street coverage
        preference: google.maps.StreetViewPreference.NEAREST,
        source: google.maps.StreetViewSource.OUTDOOR,
      },
      (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
          const panoLocation = data.location.latLng;

          if (!panoRef.current) {
            panoRef.current = new google.maps.StreetViewPanorama(containerRef.current!, {
              position: panoLocation,
              pov: { heading: Math.random() * 360, pitch: 0 },
              zoom: 0,
              addressControl: false,
              showRoadLabels: false,
              linksControl: true,
              panControl: false,
              zoomControl: true,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
            });
          } else {
            panoRef.current.setPosition(panoLocation);
            panoRef.current.setPov({ heading: Math.random() * 360, pitch: 0 });
          }
        } else {
          // No Street View coverage — notify parent to skip
          setNoCoverage(true);
          onNoCoverage?.();
        }
      }
    );
  }, [apiLoaded, lat, lng]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-navy-card ${className || ""}`}>
        <div className="text-center p-4">
          <p className="text-slate-400 text-sm">Google Maps API key not configured</p>
          <p className="text-slate-600 text-xs mt-1">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {!apiLoaded && (
        <div className="flex h-full items-center justify-center bg-navy-card">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green/30 border-t-green" />
        </div>
      )}

      {noCoverage && (
        <div className="flex h-full items-center justify-center bg-navy-card">
          <div className="text-center p-4">
            <p className="text-slate-400 text-sm">No Street View coverage here</p>
            <p className="text-slate-600 text-xs mt-1">Place your best guess on the map</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ display: apiLoaded && !noCoverage ? "block" : "none" }}
      />
    </div>
  );
}
