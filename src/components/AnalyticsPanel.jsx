import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';

const AnalyticsPanel = ({ predictionData }) => {
  const totalWilayah = Object.keys(predictionData).length;
  
  let countKritis = 0;
  let countWaspada = 0;
  let countAman = 0;
  let wilayahPrioritas = [];

  Object.entries(predictionData).forEach(([kecamatan, status]) => {
    if (status === 'Kritis') {
      countKritis++;
      wilayahPrioritas.push({ nama: kecamatan, status, warna: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' });
    } else if (status === 'Waspada') {
      countWaspada++;
      wilayahPrioritas.push({ nama: kecamatan, status, warna: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' });
    } else {
      countAman++;
    }
  });

  wilayahPrioritas.sort((a, b) => (a.status === 'Kritis' ? -1 : 1));

  if (totalWilayah === 0) {
    return (
      <div className="w-80 h-screen bg-slate-900 border-l border-slate-800 text-white p-6 flex flex-col justify-center items-center text-center">
        <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-400">Panel Analitik</h3>
        <p className="text-sm text-slate-500 mt-2">Jalankan analisis AI untuk melihat metrik dan prioritas wilayah.</p>
      </div>
    );
  }

  return (
    <div className="w-80 h-screen bg-slate-900 border-l border-slate-800 text-white p-6 flex flex-col overflow-y-auto shadow-2xl z-10">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="text-blue-400" /> Ringkasan Analitik
      </h2>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Grafik Sebaran Status</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400 font-medium">Kritis ({countKritis})</span>
              <span className="text-slate-400">{Math.round((countKritis/totalWilayah)*100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(countKritis/totalWilayah)*100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-yellow-400 font-medium">Waspada ({countWaspada})</span>
              <span className="text-slate-400">{Math.round((countWaspada/totalWilayah)*100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(countWaspada/totalWilayah)*100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-400 font-medium">Aman ({countAman})</span>
              <span className="text-slate-400">{Math.round((countAman/totalWilayah)*100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(countAman/totalWilayah)*100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" /> Daftar Prioritas Respons
        </h3>
        
        {wilayahPrioritas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-slate-400 text-center">Seluruh wilayah dalam kondisi aman. Tidak ada prioritas darurat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wilayahPrioritas.map((wilayah, index) => (
              <div key={index} className={`p-3 rounded-lg border ${wilayah.bg} flex justify-between items-center`}>
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Kecamatan</div>
                  <div className="font-bold text-sm">{wilayah.nama}</div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full border ${wilayah.warna} border-current flex items-center gap-1`}>
                  {wilayah.status === 'Kritis' ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {wilayah.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;