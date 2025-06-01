// components/ui/LoadingSpinner.tsx
'use client';

import React from 'react';

interface LoadingSpinnerProps {
  title?: string;
  subtitle?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  title = "Cargando datos de rendimiento",
  subtitle = "Analizando métricas del equipo..."
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-96 space-y-4">
      <div className="relative">
        <div className="h-24 w-24 border-4 border-muted rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 h-24 w-24 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};