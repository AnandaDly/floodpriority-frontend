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
  const [mobileTab, setMobileTab] = useState<'sidebar' | 'map' | 'analytics'>('map');

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
    // Kita kembalikan ke h-screen dan overflow-hidden agar tidak bisa di-scroll kelewatan
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden font-sans bg-slate-950">
      
      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* SIDEBAR: Muncul jika tab 'sidebar' aktif (di HP), atau selalu muncul di Laptop (md:block) */}
        <div className={`${mobileTab === 'sidebar' ? 'block w-full' : 'hidden'} md:block md:w-80 h-full shrink-0 z-20`}>
          <Sidebar onPredict={handlePredict} />
        </div>

        {/* PETA: Muncul jika tab 'map' aktif (di HP), atau selalu muncul di Laptop (md:block) */}
        <div className={`${mobileTab === 'map' ? 'block w-full' : 'hidden'} md:block flex-1 relative h-full z-10`}>
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button
              onClick={() => setShowRadar(!showRadar)}
              className={`px-3 py-2 text-sm md:text-base md:px-4 md:py-2 rounded-full font-bold shadow-lg transition-all ${
                showRadar
                  ? 'bg-blue-600 text-white border-2 border-blue-400'
                  : 'bg-slate-800 text-slate-300 border-2 border-slate-700'
              }`}
            >
              {showRadar ? '🛰️ Matikan' : '📡 Radar'}
            </button>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="text-white text-lg md:text-xl font-bold animate-pulse">AI Sedang Menganalisis...</div>
            </div>
          )}
          
          <MapContainer
            geojsonData={mapData}
            predictionData={predictionData}
            showRadar={showRadar}
          />
        </div>

        {/* ANALITIK: Muncul jika tab 'analytics' aktif (di HP), atau selalu muncul di Laptop (md:block) */}
        <div className={`${mobileTab === 'analytics' ? 'block w-full' : 'hidden'} md:block md:w-80 h-full shrink-0 z-20`}>
          <AnalyticsPanel predictionData={predictionData} />
        </div>
      </div>

      {/* BOTTOM NAVIGATION (HANYA MUNCUL DI HP) */}
      <div className="md:hidden w-full bg-slate-900 border-t border-slate-700 flex justify-around items-center p-2 shrink-0 z-50 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)]">
        <button 
          onClick={() => setMobileTab('sidebar')}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${mobileTab === 'sidebar' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <span className="text-xl mb-1">⚙️</span>
          <span className="text-xs">Parameter</span>
        </button>
        
        <button 
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${mobileTab === 'map' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <span className="text-xl mb-1">🗺️</span>
          <span className="text-xs">Peta</span>
        </button>
        
        <button 
          onClick={() => setMobileTab('analytics')}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${mobileTab === 'analytics' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <span className="text-xl mb-1">📈</span>
          <span className="text-xs">Analitik</span>
        </button>
      </div>

    </div>
  );
};

export default App;