"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import BackendToFirebaseSync from '@/services/auth/backendToFirebaseSync';

export default function NewUserPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER]}>
      <NewUserContent />
    </ProtectedRoute>
  );
}

function NewUserContent() {
  const router = useRouter();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DEVELOPER);
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.REMOTE);
  const [active, setActive] = useState(true);
  const [sendPasswordEmail, setSendPasswordEmail] = useState(true);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form validation
  const validateForm = (): boolean => {
    if (!email || !username || !fullName) {
      setError('Por favor completa todos los campos requeridos');
      return false;
    }
    
    if (password && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      setIsSaving(false);
      return;
    }
    
    try {
      // Step 1: Create user in backend
      const userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'> = {
        full_name: fullName,
        email,
        username,
        role,
        work_mode: workMode,
        active,
        last_login: new Date().toISOString()
      };
      
      const backendUser = await UserService.createUser(userData);
      
      if (!backendUser) {
        throw new Error('Error al crear usuario en el backend');
      }
      
      // Step 2: Create or check user in Firebase
      if (password) {
        // If password is provided, create user in Firebase with that password
        try {
          await BackendToFirebaseSync.createFirebaseUserWithPassword(
            backendUser, 
            password,
            sendPasswordEmail
          );
        
          toast({
            title: "Usuario creado",
            description: "El usuario ha sido creado correctamente en el backend y en Firebase.",
            variant: "default",
          });
        } catch (firebaseError: unknown) { // Use `unknown` instead of `any`
          if (firebaseError instanceof Error && 'code' in firebaseError) {
            // Check if error is because user already exists
            if ((firebaseError as { code: string }).code === 'auth/email-already-in-use') {
              toast({
                title: "Usuario parcialmente creado",
                description: "El usuario ya existe en Firebase pero se ha creado en el backend.",
                variant: "default",
              });
            } else {
              console.error('Error creating Firebase user:', firebaseError);
              toast({
                title: "Usuario parcialmente creado",
                description: "El usuario se creó en el backend pero hubo un error al crearlo en Firebase.",
                variant: "destructive",
              });
            }
          } else {
            console.error('Unexpected error:', firebaseError);
          }
        }
      } else {
        // If no password, create Firebase user with temp password
        try {
          await BackendToFirebaseSync.syncBackendUserToFirebase(
            backendUser.id!,
            sendPasswordEmail
          );
          
          toast({
            title: "Usuario creado",
            description: "El usuario ha sido creado correctamente en el backend y en Firebase.",
            variant: "default",
          });
        } catch (firebaseError) {
          console.error('Error syncing to Firebase:', firebaseError);
          toast({
            title: "Usuario parcialmente creado",
            description: "El usuario se creó en el backend pero hubo un error al sincronizarlo con Firebase.",
            variant: "destructive",
          });
        }
      }
      
      setSuccess('Usuario creado correctamente');
      setTimeout(() => {
        router.push(`/users/${backendUser.id || ''}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error al crear el usuario');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/users" passHref>
            <Button variant="outline" size="sm" className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Información del usuario</CardTitle>
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
                  <Label htmlFor="fullName">Nombre completo*</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
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
                  <Label htmlFor="username">Nombre de usuario*</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Rol*</Label>
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
                <Label htmlFor="workMode">Modo de trabajo*</Label>
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
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">Configuración de cuenta en Firebase</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Puedes establecer una contraseña inicial o dejar que el sistema envíe un correo para resetearla.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña (opcional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Dejar vacío para generar automáticamente"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!password}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 pt-2">
                <div className="flex items-center space-x-2">
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
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendPasswordEmail"
                    checked={sendPasswordEmail}
                    onChange={(e) => setSendPasswordEmail(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="sendPasswordEmail" className="text-sm font-medium text-gray-700">
                    Enviar correo para establecer/resetear contraseña
                  </Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/users')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando usuario...
                    </>
                  ) : (
                    'Crear usuario'
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