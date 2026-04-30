import React, { useEffect, useRef, useState } from 'react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';

const MapContainer = ({ geojsonData, predictionData, showRadar }) => {
  const mapContainerRef = useRef(null); 
  const mapInstanceRef = useRef(null);  
  const dataSourceRef = useRef(null);   
  const weatherLayerRef = useRef(null); 
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = new atlas.Map(mapContainerRef.current, {
      authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY || ''
      },
      center: [98.6722, 3.5952],
      zoom: 11,
      style: 'grayscale_dark'
    });

    mapInstanceRef.current = map;

    map.events.add('ready', () => {
      dataSourceRef.current = new atlas.source.DataSource();
      map.sources.add(dataSourceRef.current);

      weatherLayerRef.current = new atlas.layer.TileLayer({
        tileUrl: `https://atlas.microsoft.com/map/tile?subscription-key=${import.meta.env.VITE_AZURE_MAPS_KEY}&api-version=2.0&tilesetId=microsoft.weather.radar.main&zoom={z}&x={x}&y={y}`,
        opacity: 0.8,
        tileSize: 256,
        bounds: [-180, -85, 180, 85],
        visible: showRadar || false 
      });

      const polygonLayer = new atlas.layer.PolygonLayer(dataSourceRef.current, null, {
        fillColor: ['get', 'fillColor'],
        fillOpacity: 0.5, 
        strokeColor: '#ffffff',
        strokeWidth: 1
      });

      map.layers.add([weatherLayerRef.current, polygonLayer]);

      map.events.add('mousemove', polygonLayer, (e) => {
        map.getCanvasContainer().style.cursor = 'pointer';
      });

      map.events.add('mouseout', polygonLayer, (e) => {
        map.getCanvasContainer().style.cursor = 'default';
      });

      const popup = new atlas.Popup({
        pixelOffset: [0, -20],
        closeButton: true,
        fillColor: 'rgba(30, 41, 59, 0.9)'
      });

      map.events.add('click', polygonLayer, (e) => {
        if (e.shapes && e.shapes.length > 0) {
          const prop = e.shapes[0].getProperties();
          const htmlContent = `
            <div style="padding: 15px; font-family: sans-serif; color: white; min-width: 180px;">
              <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Kecamatan</div>
              <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #60a5fa;">${prop.name}</h3>
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #475569; padding-top: 8px; margin-top: 8px;">
                <span style="font-size: 13px; color: #cbd5e1;">Status Prediksi:</span>
                <span style="font-size: 13px; font-weight: bold; color: ${prop.status === 'Kritis' ? '#ef4444' : prop.status === 'Waspada' ? '#eab308' : '#22c55e'};">
                  ${prop.status || 'Aman'}
                </span>
              </div>
            </div>
          `;
          popup.setOptions({ content: htmlContent, position: e.position });
          popup.open(map);
        }
      });

      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapReady && weatherLayerRef.current) {
      weatherLayerRef.current.setOptions({ visible: showRadar });
    }
  }, [mapReady, showRadar]);

  useEffect(() => {
    if (mapReady && geojsonData && dataSourceRef.current) {
      dataSourceRef.current.clear(); 
      dataSourceRef.current.add(geojsonData);
    }
  }, [mapReady, geojsonData]);

  useEffect(() => {
    if (!mapReady || !dataSourceRef.current || !predictionData) return;
    
    const shapes = dataSourceRef.current.getShapes();
    
    shapes.forEach(shape => {
      const prop = shape.getProperties();
      const namaKecamatan = prop.name; 
      const statusWilayah = predictionData[namaKecamatan] || 'Aman';
      
      let color = 'rgba(34, 197, 94, 0.5)'; 
      if (statusWilayah === 'Kritis') color = 'rgba(239, 68, 68, 0.8)'; 
      if (statusWilayah === 'Waspada') color = 'rgba(234, 179, 8, 0.8)'; 

      shape.setProperties({
        ...prop,
        status: statusWilayah,
        fillColor: color
      });
    });
  }, [mapReady, predictionData]);

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: '100vh', backgroundColor: '#1e293b' }} />
  );
};

export default MapContainer;