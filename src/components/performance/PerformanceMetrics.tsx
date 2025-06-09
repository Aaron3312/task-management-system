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
  totalHoursWorked
}) => {
  console.log('PerformanceMetrics - Tareas Completadas displayed:', totalTasksCompleted);
  const metrics = [
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};