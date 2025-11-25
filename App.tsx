import React, { useState, useEffect } from 'react';
import { runSimulation } from './services/meatModel';
import { scenarios } from './services/scenarios';
import { SimulationConfig, SimulationResult } from './types';
import { TempChart, MicrobeChart, QualityChart, ChemicalChart } from './components/SimulationCharts';
import { RotateCcw, Thermometer, Droplet, Activity, Skull, Sliders } from 'lucide-react';

const SPOILAGE_THRESHOLD_CFU = 10000000;

function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0].id);
  const [customConfig, setCustomConfig] = useState<SimulationConfig>(scenarios[0]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Скидання налаштувань при зміні сценарію
  useEffect(() => {
    const defaultScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
    setCustomConfig(defaultScenario);
  }, [selectedScenarioId]);

  // Функція запуску симуляції
  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Використовуємо setTimeout, щоб дати UI час на оновлення перед важкими обчисленнями
    setTimeout(() => {
      const data = runSimulation(customConfig);
      
      // Знаходимо час псування
      const spoilageStep = data.find(step => step.microbes >= SPOILAGE_THRESHOLD_CFU);
      const spoilageTime = spoilageStep ? spoilageStep.time : null;

      setResult({
        config: customConfig,
        data,
        spoilageTime
      });
      setIsSimulating(false);
    }, 100);
  };

  // Автозапуск при зміні конфігурації
  useEffect(() => {
    handleRunSimulation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customConfig]);

  // Останній крок даних для відображення поточних KPI
  const lastStep = result?.data[result.data.length - 1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Цифровий Двійник: Зберігання М'яса</h1>
              <p className="text-xs text-slate-400">Симуляція біохімічних процесів</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Scenario Selector */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Вибір Сценарію</h2>
              <div className="space-y-2">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenarioId(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 border ${
                      selectedScenarioId === s.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-sm'
                        : 'hover:bg-slate-50 border-transparent text-slate-600'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sliders size={16} /> Налаштування
              </h2>
              
              <div className="space-y-5">
                {/* Temp Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-slate-600">Температура (°C)</span>
                    <span className="font-bold text-blue-600">{customConfig.targetEnvTemp}°C</span>
                  </div>
                  <input 
                    type="range" 
                    min="-5" 
                    max="20" 
                    step="0.5"
                    value={customConfig.targetEnvTemp}
                    onChange={(e) => setCustomConfig({
                      ...customConfig, 
                      targetEnvTemp: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>-5°C</span>
                    <span>20°C</span>
                  </div>
                </div>

                {/* Humidity Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-slate-600">Вологість (%)</span>
                    <span className="font-bold text-blue-600">{customConfig.baseHumidity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    step="1"
                    value={customConfig.baseHumidity}
                    onChange={(e) => setCustomConfig({
                      ...customConfig, 
                      baseHumidity: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>20%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                   <div className="flex justify-between">
                      <span>Тривалість:</span>
                      <span className="font-medium text-slate-900">{customConfig.durationHours} год</span>
                   </div>
                   <div className="flex justify-between">
                      <span>Пакування:</span>
                      <span className="font-medium text-slate-900">
                        {customConfig.packagingFactor < 0.2 ? 'Вакуум' : 'Звичайне'}
                      </span>
                   </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSimulating ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    <RotateCcw size={18} />
                  )}
                  Перезапустити
                </button>
              </div>
            </div>
          </div>

          {/* Results Dashboard */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            
            {/* KPI Cards */}
            {lastStep && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <Thermometer size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Кінцева Температура</p>
                    <p className="text-xl font-bold text-slate-800">{lastStep.tProd.toFixed(1)}°C</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <Skull size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Бактерії (log10)</p>
                    <p className="text-xl font-bold text-slate-800">
                      {Math.log10(lastStep.microbes).toFixed(1)} <span className="text-xs font-normal text-slate-400">log CFU</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Droplet size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Волога</p>
                    <p className="text-xl font-bold text-slate-800">{lastStep.moisture.toFixed(1)}%</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm flex items-start gap-3 ${result?.spoilageTime ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                   <div className={`p-2 rounded-lg ${result?.spoilageTime ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${result?.spoilageTime ? 'text-red-600' : 'text-green-600'}`}>Статус Продукту</p>
                    <p className={`text-lg font-bold leading-tight ${result?.spoilageTime ? 'text-red-800' : 'text-green-800'}`}>
                      {result?.spoilageTime 
                        ? `Зіпсовано на ${result.spoilageTime} год` 
                        : 'Свіжий Продукт'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description Box */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
              <strong className="block mb-1 font-semibold">Опис сценарію:</strong>
              {customConfig.description}
            </div>

            {/* Charts Grid */}
            {result && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TempChart data={result.data} />
                <MicrobeChart data={result.data} />
                <QualityChart data={result.data} />
                <ChemicalChart data={result.data} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;