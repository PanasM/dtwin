import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { SimulationStep } from '../types';

interface ChartsProps {
  data: SimulationStep[];
}

// Custom tooltip translated to Ukrainian
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded shadow-lg text-sm">
        <p className="font-bold text-slate-700 mb-1">{`Час: ${label} год`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TempChart: React.FC<ChartsProps> = ({ data }) => (
  <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-red-500"></span>
      Температурний режим (°C)
    </h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#64748b" label={{ value: 'Час (год)', position: 'insideBottomRight', offset: -5 }} />
        <YAxis stroke="#64748b" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="tEnv" name="T середовища" stroke="#94a3b8" strokeWidth={1} dot={false} />
        <Line type="monotone" dataKey="tProd" name="T продукту" stroke="#ef4444" strokeWidth={2} dot={false} />
        <ReferenceLine y={4} stroke="green" strokeDasharray="3 3" label="Норма (+4)" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const MicrobeChart: React.FC<ChartsProps> = ({ data }) => (
  <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-purple-600"></span>
      Ріст мікроорганізмів (CFU/g)
    </h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#64748b" />
        <YAxis stroke="#64748b" scale="log" domain={['auto', 'auto']} allowDataOverflow />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={10000000} stroke="red" strokeDasharray="3 3" label="Поріг псування" />
        <Area type="monotone" dataKey="microbes" name="Колонії (N)" stroke="#9333ea" fill="#d8b4fe" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const QualityChart: React.FC<ChartsProps> = ({ data }) => (
  <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-green-500"></span>
      Індекс якості Q(t)
    </h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorQ" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#64748b" />
        <YAxis stroke="#64748b" domain={[0, 1]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area type="monotone" dataKey="qualityIndex" name="Якість (Q)" stroke="#22c55e" fill="url(#colorQ)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const ChemicalChart: React.FC<ChartsProps> = ({ data }) => (
  <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
      Фізико-хімічні показники
    </h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#64748b" />
        <YAxis yAxisId="left" stroke="#3b82f6" orientation="left" domain={['auto', 'auto']} label={{ value: 'Волога (%)', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" stroke="#f59e0b" orientation="right" label={{ value: 'Окиснення (%)', angle: 90, position: 'insideRight' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="moisture" name="Волога (W)" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="fatOxidation" name="Окиснення жирів" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
