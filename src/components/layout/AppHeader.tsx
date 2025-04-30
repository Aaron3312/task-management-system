// src/components/layout/AppHeader.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import { Layers, Calendar, CheckSquare, LogOut, User, Menu, Plus } from "lucide-react";

interface AppHeaderProps {
  username?: string;
  userRole?: UserRole;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  username = 'Usuario',
  userRole,
  onLogout,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-white shadow">
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2" 
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <Layers className="h-6 w-6 text-red-600 color-red-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">
              JAI-VIER TASK MANAGEMENT SYSTEM
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Crear
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/tasks/new" passHref>
                <DropdownMenuItem>
                  <CheckSquare className="h-4 w-4 mr-2" /> Nueva tarea
                </DropdownMenuItem>
              </Link>
              {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                <>
                  <Link href="/projects/new" passHref>
                    <DropdownMenuItem>
                      <Layers className="h-4 w-4 mr-2" /> Nuevo proyecto
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/sprints/new" passHref>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" /> Nuevo sprint
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-gray-500">
                {username} {userRole && `(${userRole})`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile" passHref>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" /> Perfil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;