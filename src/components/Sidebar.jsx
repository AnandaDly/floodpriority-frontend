import React, { useState } from 'react';
import { Activity, CloudRain, Droplets, ThermometerSun } from 'lucide-react';

const Sidebar = ({ onPredict }) => {
  const [formData, setFormData] = useState({
    RR: 10,
    Hujan_3_Hari: 40,
    Hujan_7_Hari: 80,
    TN: 24,
    TX: 34,
    TAVG: 28,
    RH_AVG: 85,
    Kelembapan_3_Hari: 85
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <div className="w-80 h-screen bg-slate-900 text-white p-6 flex flex-col shadow-2xl overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-blue-400 w-8 h-8" />
        <h2 className="text-2xl font-bold">Flood<span className="text-blue-400">Priority</span></h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
        
        <div className="space-y-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-blue-300">
            <CloudRain className="w-5 h-5" /> <h3 className="font-semibold">Data Hujan (mm)</h3>
          </div>
          <div>
            <label className="text-xs text-slate-400">Curah Hujan Hari Ini: {formData.RR}</label>
            <input type="range" name="RR" min="0" max="200" value={formData.RR} onChange={handleChange} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Akumulasi 3 Hari: {formData.Hujan_3_Hari}</label>
            <input type="range" name="Hujan_3_Hari" min="0" max="300" value={formData.Hujan_3_Hari} onChange={handleChange} className="w-full accent-blue-500" />
          </div>
        </div>

        <div className="space-y-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-emerald-300">
            <Droplets className="w-5 h-5" /> <h3 className="font-semibold">Data Atmosfer</h3>
          </div>
          <div>
            <label className="text-xs text-slate-400">Kelembapan Udara (%): {formData.RH_AVG}</label>
            <input type="range" name="RH_AVG" min="50" max="100" value={formData.RH_AVG} onChange={handleChange} className="w-full accent-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Suhu Rata-rata (°C): {formData.TAVG}</label>
            <input type="range" name="TAVG" min="20" max="40" value={formData.TAVG} onChange={handleChange} className="w-full accent-emerald-500" />
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => onPredict(null, true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <Activity className="w-5 h-5" /> Tarik Data Cuaca Otomatis
        </button>
        
        <button 
          type="submit" 
          className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          Analisis Risiko Banjir
        </button>
      </form>
    </div>
  );
};

export default Sidebar;