// components/performance/PerformanceHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, Moon, Sun, Loader2 } from 'lucide-react';

interface PerformanceHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  isDarkMode,
  toggleDarkMode,
  onExport,
  isExporting = false
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-chart-1 to-chart-2 rounded-3xl mx-6 mt-6 mb-8 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/5 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-3xl"></div>
      <div className="relative px-8 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/reports" passHref>
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-background/20 hover:bg-background/30 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                disabled={isExporting}
              >
                <ChevronLeft className="h-5 w-5 mr-2" /> Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-primary-foreground mb-2">
                Rendimiento de Desarrolladores
              </h1>
              <p className="text-xl text-primary-foreground/80">
                Análisis detallado del desempeño del equipo
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right text-primary-foreground">
              <div className="text-sm opacity-80">Última actualización</div>
              <div className="font-semibold">{new Date().toLocaleDateString('es-ES')}</div>
            </div>
            


            {/* Export Button */}
            <Button 
              size="lg" 
              onClick={onExport}
              disabled={isExporting}
              className="bg-background text-primary hover:bg-background/90 shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Reporte
                </>
              )}
            </Button>
          </div>
          
          {/* Mobile Export Button */}
          <div className="md:hidden">
            <Button 
              size="sm" 
              onClick={onExport}
              disabled={isExporting}
              className="bg-background text-primary hover:bg-background/90 shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};