"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IUser, UserRole, WorkMode } from '@/core/interfaces/models';
import { UserService } from '@/services/api/userService';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';

export default function UserEditPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <UserEditContent />
    </ProtectedRoute>
  );
}

function UserEditContent() {
  const params = useParams();
  const userId = Number(params.id);
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DEVELOPER);
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.REMOTE);
  const [active, setActive] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setIsCreating(false);
      setError(null);

      try {
        const user = await UserService.getUserById(userId);

        if (user) {
          setFullName(user.full_name || '');
          setEmail(user.email || '');
          setUsername(user.username || '');
          setRole(user.role as UserRole || UserRole.DEVELOPER);
          setWorkMode(user.work_mode as WorkMode || WorkMode.REMOTE);
          setActive(user.active !== false); // Default to true if not specified
        } else {
          // User not found, but we'll prepare for create mode
          setIsCreating(true);
          setError('Usuario no encontrado. Puedes crear uno nuevo.');

          // Default values for new user
          setFullName('');
          setEmail('');
          setUsername(`user_${userId}`);
          setRole(UserRole.DEVELOPER);
          setWorkMode(WorkMode.REMOTE);
          setActive(true);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Error al cargar los datos del usuario. Puedes intentar crear uno nuevo.');
        setIsCreating(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const userData: Partial<IUser> = {
        full_name: fullName,
        email,
        username,
        role,
        work_mode: workMode,
        active,
        updated_at: new Date().toISOString(),
      };

      let result: IUser | null;

      if (isCreating) {
        // Create new user
        result = await UserService.createUser(userData as Omit<IUser, 'id' | 'created_at' | 'updated_at'>);

        if (result) {
          toast({
            title: "Usuario creado",
            description: "El usuario ha sido creado correctamente.",
            variant: "default",
          });

          setSuccess('Usuario creado correctamente');
          setTimeout(() => {
            router.push(`/users/${result?.id || ''}`);
          }, 1500);
        }
      } else {
        // Update existing user
        result = await UserService.updateUser(userId, userData);

        if (result) {
          toast({
            title: "Usuario actualizado",
            description: "El usuario ha sido actualizado correctamente.",
            variant: "default",
          });

          setSuccess('Usuario actualizado correctamente');
          setTimeout(() => {
            router.push(`/users/${userId}`);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Error al guardar los datos del usuario');

      toast({
        title: "Error",
        description: "Ocurrió un error al guardar los datos del usuario.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href={isCreating ? "/users" : `/users/${userId}`} passHref>
            <Button variant="outline" size="sm" className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{isCreating ? 'Crear Usuario' : 'Editar Usuario'}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Información del nuevo usuario' : 'Información del usuario'}</CardTitle>
            {isCreating && (
              <Alert variant="warning" className="mt-2 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-800">
                  Se está creando un nuevo usuario porque el solicitado no existe.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                      <SelectItem value={UserRole.DEVELOPER}>Desarrollador</SelectItem>
                      <SelectItem value={UserRole.TESTER}>Tester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workMode">Modo de trabajo</Label>
                <Select value={workMode} onValueChange={(value) => setWorkMode(value as WorkMode)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modo de trabajo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WorkMode.REMOTE}>Remoto</SelectItem>
                    <SelectItem value={WorkMode.OFFICE}>Oficina</SelectItem>
                    <SelectItem value={WorkMode.HYBRID}>Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Usuario activo
                </Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(isCreating ? "/users" : `/users/${userId}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCreating ? 'Creando...' : 'Guardando...'}
                    </>
                  ) : (
                    isCreating ? 'Crear usuario' : 'Guardar cambios'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}