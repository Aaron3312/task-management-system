// components/performance/PerformanceMetrics.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, CheckCircle2, Clock, TrendingUp, Award, Zap } from 'lucide-react';

interface PerformanceMetricsProps {
  activeDevelopers: number;
  activeSprints: number;
  totalTasksCompleted: number;
  totalHoursWorked: number;
  advancedMetrics?: {
    totalTasksAssigned: number;
    completionRate: number;
    averageHoursPerTask: number;
    productivityIndex: number;
    totalEstimatedHours: number;
    totalRealHours: number;
    timeVariance: number;
    onTimeDeliveryRate: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient, 
  iconBg 
}) => (
  <Card className={`border-0 shadow-xl ${gradient} text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`${iconBg.replace('bg-', 'text-')} font-medium`}>{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          <div className={`flex items-center mt-2 ${iconBg.replace('bg-', 'text-')}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 mr-1" })}
            <span className="text-sm">{subtitle}</span>
          </div>
        </div>
        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8" })}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  activeDevelopers,
  activeSprints,
  totalTasksCompleted,
  totalHoursWorked,
  advancedMetrics
}) => {
  console.log('PerformanceMetrics - Tareas Completadas displayed:', totalTasksCompleted);
  
  const basicMetrics = [
    {
      title: "Desarrolladores Activos",
      value: activeDevelopers,
      subtitle: `En ${activeSprints} sprints`,
      icon: <Users />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
      iconBg: "text-blue-100"
    },
    {
      title: "Sprints Analizados",
      value: activeSprints,
      subtitle: "Período activo",
      icon: <Calendar />,
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700",
      iconBg: "text-emerald-100"
    },
    {
      title: "Tareas Completadas",
      value: totalTasksCompleted,
      subtitle: "Total ejecutadas",
      icon: <CheckCircle2 />,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
      iconBg: "text-purple-100"
    },
    {
      title: "Horas Trabajadas",
      value: `${Math.round(totalHoursWorked)}h`,
      subtitle: "Tiempo invertido",
      icon: <Clock />,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700",
      iconBg: "text-orange-100"
    }
  ];

  const advancedMetricsCards = advancedMetrics ? [
    {
      title: "Tasa de Completación",
      value: `${advancedMetrics.completionRate.toFixed(1)}%`,
      subtitle: `${totalTasksCompleted}/${advancedMetrics.totalTasksAssigned} tareas`,
      icon: <TrendingUp />,
      gradient: "bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
      iconBg: "text-green-100"
    },
    {
      title: "Índice de Productividad",
      value: `${advancedMetrics.productivityIndex.toFixed(1)}%`,
      subtitle: "Estimado vs Real",
      icon: <Award />,
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
      iconBg: "text-indigo-100"
    },
    {
      title: "Promedio Horas/Tarea",
      value: `${advancedMetrics.averageHoursPerTask.toFixed(1)}h`,
      subtitle: "Por tarea completada",
      icon: <Zap />,
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700",
      iconBg: "text-pink-100"
    },
    {
      title: "Variación de Tiempo",
      value: `${advancedMetrics.timeVariance > 0 ? '+' : ''}${advancedMetrics.timeVariance.toFixed(1)}%`,
      subtitle: "vs Estimación",
      icon: <TrendingUp />,
      gradient: advancedMetrics.timeVariance > 10 
        ? "bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700"
        : advancedMetrics.timeVariance < -10
        ? "bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"
        : "bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700",
      iconBg: advancedMetrics.timeVariance > 10 
        ? "text-red-100"
        : advancedMetrics.timeVariance < -10
        ? "text-green-100"
        : "text-yellow-100"
    }
  ] : [];

  const allMetrics = [...basicMetrics, ...advancedMetricsCards];

  return (
    <div className="space-y-6">
      {/* Basic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {basicMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
      
      {/* Advanced Metrics */}
      {advancedMetrics && advancedMetricsCards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Métricas Avanzadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedMetricsCards.map((metric, index) => (
              <MetricCard key={`advanced-${index}`} {...metric} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};