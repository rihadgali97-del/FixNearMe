import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, AlertCircle, Layers } from 'lucide-react';
import { BAHIR_DAR_CENTER } from '../utils/neighborhoods.js';

export default function InteractiveMap({
  reports = [],
  selectedReport = null,
  pickerMode = false,
  selectedCoords = null,
  onSelectCoords = null,
  height = 'h-96'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const initialLat = selectedCoords?.lat || selectedReport?.latitude || BAHIR_DAR_CENTER.lat;
      const initialLng = selectedCoords?.lng || selectedReport?.longitude || BAHIR_DAR_CENTER.lng;
      const initialZoom = pickerMode || selectedReport ? 15 : 13;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Picker mode click handler
      if (pickerMode && onSelectCoords) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          onSelectCoords({
            lat: parseFloat(lat.toFixed(5)),
            lng: parseFloat(lng.toFixed(5))
          });
        });
      }
    } catch (err) {
      console.error('Leaflet initialization error:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update picker marker when selectedCoords changes
  useEffect(() => {
    if (!mapInstanceRef.current || !pickerMode) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    if (selectedCoords && selectedCoords.lat && selectedCoords.lng) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 3px solid white; transform: translate(-17px, -17px);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
        icon: pickerIcon
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong>Selected Location</strong><br/>
          GPS: ${selectedCoords.lat}, ${selectedCoords.lng}
        </div>
      `);

      pickerMarkerRef.current = marker;
      mapInstanceRef.current.panTo([selectedCoords.lat, selectedCoords.lng]);
    }
  }, [selectedCoords, pickerMode]);

  // Update reports pins
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || pickerMode) return;

    markersLayerRef.current.clearLayers();

    const reportsWithCoords = reports.filter(r => r.latitude && r.longitude);

    reportsWithCoords.forEach(report => {
      let pinColor = '#0284c7'; // sky
      if (report.status === 'resolved') pinColor = '#059669'; // emerald
      if (report.priority === 'urgent') pinColor = '#e11d48'; // red
      if (report.status === 'in_progress') pinColor = '#d97706'; // amber

      const customIcon = L.divIcon({
        className: 'custom-report-pin',
        html: `
          <div style="background-color: ${pinColor}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid white; transform: translate(-15px, -15px);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 180px; max-width: 220px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 13px;">${report.title}</div>
          <div style="color: #64748b; margin-bottom: 6px;">📍 ${report.neighborhood} ${report.landmark ? `• ${report.landmark}` : ''}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span style="font-weight: 600; text-transform: uppercase; font-size: 10px; color: ${pinColor};">${report.status.replace('_', ' ')}</span>
            <a href="/reports/${report.id}" style="color: #059669; font-weight: 600; text-decoration: none;">View &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
    });

    // If single selected report, pan to it
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      mapInstanceRef.current.setView([selectedReport.latitude, selectedReport.longitude], 15);
    }
  }, [reports, selectedReport, pickerMode]);

  if (mapError) {
    return (
      <div className={`w-full ${height} rounded-xl bg-slate-100 border border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-600`}>
        <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />
        <h4 className="font-semibold text-slate-800">Map Unavailable</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Interactive tiles could not be loaded. Reports are listed below with neighborhood landmarks and Kebele references.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapContainerRef} className={`w-full ${height} z-0`} />

      {pickerMode && (
        <div className="absolute top-3 left-3 z-10 bg-slate-900/85 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click anywhere on the map to place GPS pin</span>
        </div>
      )}

      <div className="absolute bottom-2 right-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium text-slate-700 shadow border border-slate-200">
        Bahir Dar, Ethiopia
      </div>
    </div>
  );
}
