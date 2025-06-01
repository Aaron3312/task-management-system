// components/performance/PerformanceCharts.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BarChart as BarChartIcon, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface ChartData {
  sprint: string;
  [key: string]: string | number;
}

interface Developer {
  id: number;
  username: string;
  full_name?: string;
}

interface PerformanceChartsProps {
  totalHoursPerSprintData: ChartData[];
  hoursWorkedChartData: ChartData[];
  tasksCompletedChartData: ChartData[];
  developers: Developer[];
  selectedDeveloper: string;
  isDarkMode: boolean;
  developerColors: string[];
  performanceData?: any[]; // Add performance data for burndown
  selectedSprint: string;
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  headerGradient: string;
  children: React.ReactNode;
  description?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon, headerGradient, children, description }) => (
  <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-lg overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] group">
    <CardHeader className={`${headerGradient} text-white relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardTitle className="text-2xl flex items-center relative z-10">
        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
          {React.cloneElement(icon as React.ReactElement, { className: "h-7 w-7" })}
        </div>
        <div>
          <div className="text-xl font-bold">{title}</div>
          {description && <div className="text-sm text-white/80 font-normal">{description}</div>}
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-8 bg-gradient-to-br from-card via-card to-muted/20">
      <div className="h-96">
        {children}
      </div>
    </CardContent>
  </Card>
);

// Custom tooltip component with decimal formatting
const CustomTooltip = ({ active, payload, label, isDarkMode, suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-4 rounded-xl shadow-2xl border-0 backdrop-blur-sm`}>
        <p className="font-semibold text-lg mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="font-medium">{entry.name}:</span>
            <span className="font-bold">{`${Number(entry.value).toFixed(1)}${suffix}`}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Format Y-axis values
const formatYAxisValue = (value: number) => {
  return Number(value).toFixed(value % 1 === 0 ? 0 : 1);
};

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  totalHoursPerSprintData,
  hoursWorkedChartData,
  tasksCompletedChartData,
  developers,
  selectedDeveloper,
  isDarkMode,
  developerColors,
  performanceData = [],
  selectedSprint
}) => {
  const chartProps = {
    margin: { top: 20, right: 30, left: 20, bottom: 70 },
    cartesianGridStroke: isDarkMode ? "#374151" : "#e2e8f0",
    axisStroke: isDarkMode ? "#9ca3af" : "#6b7280",
    axisFill: isDarkMode ? "#e5e7eb" : "#374151",
  };

  const filteredDevelopers = developers.filter(dev => 
    selectedDeveloper === 'all' || dev.id === parseInt(selectedDeveloper)
  );

  // Generate efficiency data from performance data
  const generateEfficiencyData = () => {
    if (!performanceData || performanceData.length === 0) {
      return [];
    }

    // Group by developer and calculate efficiency
    const developerStats = new Map();
    
    performanceData.forEach(p => {
      if (selectedSprint !== 'all' && p.sprintId !== parseInt(selectedSprint)) return;
      if (selectedDeveloper !== 'all' && p.developerId !== parseInt(selectedDeveloper)) return;
      
      const devId = p.developerId;
      if (!developerStats.has(devId)) {
        developerStats.set(devId, {
          name: p.developerName,
          efficiency: 0,
          count: 0
        });
      }
      
      const stats = developerStats.get(devId);
      if (p.efficiency && p.efficiency > 0) {
        stats.efficiency += p.efficiency;
        stats.count += 1;
      }
    });

    return Array.from(developerStats.values())
      .filter(stats => stats.count > 0)
      .map(stats => ({
        developer: stats.name,
        efficiency: stats.efficiency / stats.count
      }));
  };


  return (
    <div className="space-y-10">
      {/* Enhanced Total Hours Chart - Area Chart with Gradient */}
      <ChartCard
        title="Evolución de Horas Trabajadas"
        description="Tendencia temporal del esfuerzo del equipo"
        icon={<TrendingUp />}
        headerGradient="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={totalHoursPerSprintData} {...chartProps}>
            <defs>
              <linearGradient id="totalHoursGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartProps.cartesianGridStroke} opacity={0.3} />
            <XAxis 
              dataKey="sprint" 
              angle={-45} 
              textAnchor="end"
              height={70}
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
            />
            <YAxis 
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { fill: chartProps.axisFill, fontWeight: 600 } }} 
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} suffix=" hrs" />} />
            <Area 
              type="monotone" 
              dataKey="totalHours" 
              stroke="#6366f1" 
              strokeWidth={4}
              fill="url(#totalHoursGradient)"
              filter="url(#glow)"
              dot={{ fill: '#6366f1', r: 6, strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 8, fill: '#ec4899', stroke: '#ffffff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Enhanced Hours by Developer Chart - Composed Chart */}
      <ChartCard
        title="Distribución de Horas por Desarrollador"
        description="Comparativa del tiempo invertido por cada miembro del equipo"
        icon={<BarChartIcon />}
        headerGradient="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={hoursWorkedChartData} {...chartProps}>
            <defs>
              {filteredDevelopers.map((dev, index) => (
                <linearGradient key={`grad-${dev.id}`} id={`gradient-${dev.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={developerColors[index % developerColors.length]} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={developerColors[index % developerColors.length]} stopOpacity={0.3}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="5 5" stroke={chartProps.cartesianGridStroke} opacity={0.3} />
            <XAxis 
              dataKey="sprint" 
              angle={-45} 
              textAnchor="end"
              height={70}
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
            />
            <YAxis 
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { fill: chartProps.axisFill, fontWeight: 600 } }} 
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} suffix=" hrs" />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {filteredDevelopers.map((dev, index) => (
              <Bar 
                key={dev.id} 
                dataKey={dev.username} 
                name={dev.full_name || dev.username} 
                fill={`url(#gradient-${dev.id})`}
                radius={[8, 8, 0, 0]}
                strokeWidth={2}
                stroke={developerColors[index % developerColors.length]}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Efficiency Comparison Chart */}
      <ChartCard
        title="Eficiencia por Desarrollador"
        description="Comparación de horas estimadas vs. horas reales trabajadas"
        icon={<TrendingUp />}
        headerGradient="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={generateEfficiencyData()} {...chartProps}>
            <defs>
              <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.7}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartProps.cartesianGridStroke} opacity={0.3} />
            <XAxis 
              dataKey="developer" 
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              label={{ value: 'Eficiencia %', angle: -90, position: 'insideLeft', style: { fill: chartProps.axisFill, fontWeight: 600 } }} 
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Eficiencia']}
              contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                color: isDarkMode ? '#f9fafb' : '#111827'
              }}
            />
            <Bar 
              dataKey="efficiency" 
              fill="url(#efficiencyGradient)"
              radius={[6, 6, 0, 0]}
              stroke="#10b981"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Enhanced Tasks Completed Chart */}
      <ChartCard
        title="Productividad en Tareas Completadas"
        description="Métricas de finalización de tareas por desarrollador"
        icon={<CheckCircle2 />}
        headerGradient="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={tasksCompletedChartData} {...chartProps}>
            <defs>
              {filteredDevelopers.map((dev, index) => {
                const color = developerColors[index % developerColors.length];
                return (
                  <g key={`defs-${dev.id}`}>
                    <linearGradient id={`taskGradient-${dev.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="50%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.5}/>
                    </linearGradient>
                    <filter id={`shadow-${dev.id}`}>
                      <feDropShadow dx="3" dy="3" stdDeviation="2" floodOpacity="0.3"/>
                    </filter>
                  </g>
                );
              })}
            </defs>
            <CartesianGrid 
              strokeDasharray="1 3" 
              stroke={chartProps.cartesianGridStroke} 
              opacity={0.2}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="sprint" 
              angle={-45} 
              textAnchor="end"
              height={70}
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: chartProps.axisStroke, strokeWidth: 2 }}
            />
            <YAxis 
              label={{ value: 'Tareas', angle: -90, position: 'insideLeft', style: { fill: chartProps.axisFill, fontWeight: 600 } }} 
              stroke={chartProps.axisStroke}
              tick={{ fill: chartProps.axisFill, fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: chartProps.axisStroke, strokeWidth: 2 }}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} suffix=" tareas" />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            {filteredDevelopers.map((dev, index) => (
              <Bar 
                key={dev.id} 
                dataKey={dev.username} 
                name={dev.full_name || dev.username} 
                fill={`url(#taskGradient-${dev.id})`}
                radius={[6, 6, 0, 0]}
                filter={`url(#shadow-${dev.id})`}
                stroke={developerColors[index % developerColors.length]}
                strokeWidth={1}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};