"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { toast } from './use-toast';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface ServerHealthCheckProps {
  interval?: number; // Check interval in milliseconds
  showSuccessToast?: boolean;
}

export function ServerHealthCheck({ 
  interval = 30000, // 30 seconds by default
  showSuccessToast = false 
}: ServerHealthCheckProps) {
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Function to check server health
  const checkServerHealth = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);

    try {
      const isAvailable = await apiClient.healthCheck();

      // Update state
      setIsServerAvailable(isAvailable);
      setLastChecked(new Date());

      // If status changed, show toast
      if (isAvailable && isServerAvailable === false) {
        toast({
          title: "Servidor disponible",
          description: "Se ha restablecido la conexión con el servidor.",
          variant: "default",
        });
      } else if (!isAvailable && isServerAvailable === true) {
        toast({
          title: "Servidor no disponible",
          description: "Se ha perdido la conexión con el servidor. Algunas funciones pueden no estar disponibles.",
          variant: "destructive",
        });
      } else if (isAvailable && showSuccessToast && isServerAvailable === null) {
        // First check and server is available
        toast({
          title: "Servidor disponible",
          description: "Conexión establecida con el servidor.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error checking server health:", error);
      setIsServerAvailable(false);

      if (isServerAvailable === true) {
        // Only show toast if status changed from available to unavailable
        toast({
          title: "Servidor no disponible",
          description: "Se ha perdido la conexión con el servidor. Algunas funciones pueden no estar disponibles.",
          variant: "destructive",
        });
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, isServerAvailable, showSuccessToast]);

  // Check server health on component mount and at regular intervals
  useEffect(() => {
    // Initial check
    checkServerHealth();
    
    // Set up interval for regular checks
    const intervalId = setInterval(checkServerHealth, interval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [interval, checkServerHealth]);

  // If still waiting for initial check
  if (isServerAvailable === null) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="bg-gray-50 border border-gray-200 shadow-lg">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
          <AlertDescription>
            Verificando conexión con el servidor...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If server is unavailable
  if (!isServerAvailable) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="bg-red-50 border border-red-200 shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <AlertDescription className="text-red-800 flex-1">
              No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.
              {lastChecked && (
                <span className="text-xs block mt-1 text-red-600">
                  Última verificación: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-white hover:bg-red-50 text-red-700 border-red-300"
              onClick={checkServerHealth}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // If server is available and we want to show it
  if (isServerAvailable && showSuccessToast) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="bg-green-50 border border-green-200 shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <AlertDescription className="text-green-800 flex-1">
              Conectado al servidor correctamente.
              {lastChecked && (
                <span className="text-xs block mt-1 text-green-600">
                  Última verificación: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-white hover:bg-green-50 text-green-700 border-green-300"
              onClick={checkServerHealth}
              disabled={isChecking}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // If server is available but we don't want to show success notification
  return null;
}