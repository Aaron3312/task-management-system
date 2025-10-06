'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/MockAuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkMode } from '@/core/interfaces/models';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { currentUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extract username and initials
  const username = currentUser?.username || currentUser?.email?.split('@')[0] || 'Usuario';
  const initials = (currentUser?.full_name || username).substring(0, 2).toUpperCase();

  // Load user data
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setWorkMode(currentUser.work_mode || 'REMOTO');
    }
  }, [currentUser]);

  // Handle form submission (solo muestra mensaje de éxito en demo)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    // Simular guardado
    setTimeout(() => {
      setSuccessMessage('Perfil actualizado correctamente (Demo mode - los cambios no se guardan)');
      setIsSaving(false);
    }, 1000);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{username}</CardTitle>
                  <CardDescription>{currentUser?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {successMessage && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workMode">Modo de trabajo</Label>
                  <select
                    id="workMode"
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value={WorkMode.REMOTE}>Remoto</option>
                    <option value={WorkMode.OFFICE}>En oficina</option>
                    <option value={WorkMode.HYBRID}>Híbrido</option>
                  </select>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
