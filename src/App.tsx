import React, { useEffect, useState } from 'react';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import geoData from './assets/data/export.geojson?raw';
import axios from 'axios';
import AnalyticsPanel from './components/AnalyticsPanel';

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

interface WeatherInput {
  RR: number;
  Hujan_3_Hari: number;
  Hujan_7_Hari: number;
  TN: number;
  TX: number;
  TAVG: number;
  RH_AVG: number;
  Kelembapan_3_Hari: number;
}

interface PredictionResponse {
  status: string;
  data_peta: Record<string, string>;
  data_cuaca_otomatis?: WeatherInput;
}

interface MapProperties {
  fillColor?: string;
  status?: string;
  [key: string]: unknown;
}

interface GeoFeature {
  type: string;
  properties: MapProperties;
  geometry: unknown;
}

interface GeoFeatureCollection {
  type: string;
  features: GeoFeature[];
}

const App: React.FC = () => {
  const [mapData, setMapData] = useState<GeoFeatureCollection | null>(null);
  const [predictionData, setPredictionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showRadar, setShowRadar] = useState<boolean>(false);

  useEffect(() => {
    // Parsing data GeoJSON
    const data = JSON.parse(geoData) as GeoFeatureCollection;
    
    // Memberikan warna default (Hijau/Aman) saat peta pertama kali dimuat
    data.features = data.features.map((feature) => ({
      ...feature,
      properties: { 
        ...feature.properties, 
        fillColor: 'rgba(34, 197, 94, 0.5)', 
        status: 'Aman' 
      }
    }));
    
    setMapData(data);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const handlePredict = async (weatherInput: WeatherInput | null, isAuto: boolean = false): Promise<void> => {
    setLoading(true);
    
    try {
      let response;
    
      if (isAuto) {
        response = await axios.get<PredictionResponse>(`${API_URL}/auto-predict`);
        
        if (response.data.data_cuaca_otomatis) {
          console.log("Data Cuaca Real-time dari API:", response.data.data_cuaca_otomatis);
          alert(`Data Real-time ditarik!\nHujan Hari Ini: ${response.data.data_cuaca_otomatis.RR} mm`);
        }
      } else {
        response = await axios.post<PredictionResponse>(`${API_URL}/predict`, weatherInput);
      }
      
      if (response.data.status === 'success') {
        setPredictionData(response.data.data_peta);
      }
    } catch (error) {
      console.error("Gagal terhubung ke AI Engine:", error);
      alert(`Pastikan server backend sudah berjalan!\nURL Target: ${API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden font-sans">
      <Sidebar onPredict={handlePredict} />

      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
              showRadar
                ? 'bg-blue-600 text-white border-2 border-blue-400'
                : 'bg-slate-800 text-slate-300 border-2 border-slate-700'
            }`}
          >
            {showRadar ? '🛰️ Matikan Radar Hujan' : '📡 Lihat Radar Hujan'}
          </button>
        </div>
        {loading && (
          <div className="absolute inset-0 bg-slate-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-xl font-bold animate-pulse">AI Sedang Menganalisis...</div>
          </div>
        )}
        
        <MapContainer
          geojsonData={mapData}
          predictionData={predictionData}
          showRadar={showRadar}
        />
      </div>

      <AnalyticsPanel predictionData={predictionData} />
    </div>
  );
};

export default App;