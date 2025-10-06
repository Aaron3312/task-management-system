// src/components/layout/AppHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/core/interfaces/models';
import { useDarkMode } from '@/hooks/useDarkMode';
import Link from 'next/link';
import {
  Layers,
  Calendar,
  CheckSquare,
  User,
  Menu,
  Plus,
  Moon,
  Sun
} from 'lucide-react';

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
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="bg-background border-b border-border shadow-sm dark:shadow-none relative overflow-hidden group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 via-blue-50/0 to-purple-50/0 group-hover:from-red-50/20 group-hover:via-blue-50/20 group-hover:to-purple-50/20 dark:group-hover:from-red-950/10 dark:group-hover:via-blue-950/10 dark:group-hover:to-purple-950/10 transition-all duration-700 ease-out"></div>
      
      <div className="px-3 sm:px-6 py-3 flex justify-between items-center relative z-10">
        <div className="flex items-center min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2 transition-all duration-300 hover:scale-110 hover:rotate-180 flex-shrink-0" 
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center group/logo min-w-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-2 transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-12 flex-shrink-0" />
            <h1 className="text-sm sm:text-xl font-bold text-foreground transition-all duration-300 group-hover/logo:text-red-600 dark:group-hover/logo:text-red-400 group-hover/logo:scale-105 truncate">
              <span className="hidden sm:inline">JAI-VIER TASK MANAGEMENT SYSTEM</span>
              <span className="sm:hidden">JAI-VIER TMS</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Dark Mode Toggle with enhanced animations */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-9 w-9 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/20 group/theme"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 transition-all duration-300 group-hover/theme:rotate-180 group-hover/theme:text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 transition-all duration-300 group-hover/theme:rotate-12 group-hover/theme:text-blue-600" />
            )}
          </Button>

          {/* Create Dropdown with animations */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 group/create"
              >
                <Plus className="h-4 w-4 mr-1 transition-all duration-300 group-hover/create:rotate-180" /> 
                Crear
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="animate-in slide-in-from-top-2 duration-300"
            >
              <Link href="/tasks/new" passHref>
                <DropdownMenuItem className="transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-950/20 group/item">
                  <CheckSquare className="h-4 w-4 mr-2 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-green-600" /> 
                  Nueva tarea
                </DropdownMenuItem>
              </Link>
              {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
                <>
                  <Link href="/projects/new" passHref>
                    <DropdownMenuItem className="transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/20 group/item">
                      <Layers className="h-4 w-4 mr-2 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-blue-600" /> 
                      Nuevo proyecto
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/sprints/new" passHref>
                    <DropdownMenuItem className="transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-950/20 group/item">
                      <Calendar className="h-4 w-4 mr-2 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-purple-600" /> 
                      Nuevo sprint
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown with animations */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/20 group/user"
              >
                <User className="h-5 w-5 transition-all duration-300 group-hover/user:text-indigo-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="animate-in slide-in-from-top-2 duration-300"
            >
              <DropdownMenuLabel className="transition-all duration-200 hover:text-indigo-600">
                Mi cuenta
              </DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {username} {userRole && `(${userRole})`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile" passHref>
                <DropdownMenuItem className="transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 group/item">
                  <User className="h-4 w-4 mr-2 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-indigo-600" /> 
                  Perfil
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Subtle bottom border shimmer */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200/0 to-transparent group-hover:via-blue-200/50 dark:group-hover:via-blue-700/30 transition-all duration-700"></div>
    </header>
  );
};

export default AppHeader;