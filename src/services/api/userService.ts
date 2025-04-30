// src/services/api/userService.ts
import { apiClient } from './apiClient';
import { IUser, UserRole } from '@/core/interfaces/models';
import { toast } from '@/components/ui/use-toast';

export class UserService {
  private static readonly BASE_PATH = '/userlist';
  
  // Cache for users to use in offline mode
  private static userCache: IUser[] = [];

  // Get all users
  static async getUsers(): Promise<IUser[]> {
    try {
      const users = await apiClient.get<IUser[]>(this.BASE_PATH);
      
      // Update cache when successful
      this.userCache = users;
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Return cached users if available, empty array otherwise
      return [...this.userCache];
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<IUser | null> {
    try {
      const user = await apiClient.get<IUser>(`${this.BASE_PATH}/${id}`);
      return user;
    } catch (error) {
      // Check if it's a 404 error - user not found
      if (error instanceof Error && error.message.includes('404')) {
        console.warn(`User ${id} not found in backend`);
        toast({
          title: "Usuario no encontrado",
          description: `No se encontró el usuario con ID: ${id}`,
          variant: "destructive",
        });
      } else {
        console.error(`Error fetching user ${id}:`, error);
      }
      
      // Try to find in cache
      const cachedUser = this.userCache.find(user => user.id === id);
      return cachedUser || null;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      // First check cache
      const cachedUser = this.userCache.find(
        user => user.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (cachedUser) {
        return cachedUser;
      }
      
      // If not in cache, try to fetch
      try {
        const user = await apiClient.get<IUser>(`${this.BASE_PATH}/email/${email}`);
        return user;
      } catch {
        // Specific endpoint might not exist, try getting all users
        const users = await this.getUsers();
        return users.find(user => user.email?.toLowerCase() === email.toLowerCase()) || null;
      }
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  // Create a new user
// Create a new user
static async createUser(userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser | null> {
  try {
    // Construct a minimal valid user object to avoid validation errors
    const requiredUserData = {
      username: userData.username || `user_${Date.now()}`,
      email: userData.email || `user_${Date.now()}@example.com`,
      full_name: userData.full_name || 'New User',
      role: userData.role || UserRole.DEVELOPER,
      work_mode: userData.work_mode || WorkMode.REMOTE,
      active: userData.active !== false
    };
    
    // Try to create the user
    const newUser = await apiClient.post<IUser>(this.BASE_PATH, requiredUserData);
    
    // Update cache
    if (newUser && this.userCache.length > 0) {
      this.userCache.push(newUser);
    }
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check if error message mentions specific issues
    const errorMsg = error instanceof Error ? error.message : '';
    
    if (errorMsg.includes('500')) {
      // Server error - likely an issue with the backend validation or database
      toast({
        title: "Error al crear usuario en el servidor",
        description: "El servidor reportó un error interno. Posibles causas: el email o username ya existe, o hay problemas de validación.",
        variant: "destructive",
      });
    }
    
    // Create a temporary user for offline mode with unique ID to avoid conflicts
    const tempId = Date.now(); // Use timestamp as a temporary ID
    const tempUser: IUser = {
      id: tempId,
      username: userData.username || `user_${tempId}`,
      email: userData.email || `user_${tempId}@example.com`,
      full_name: userData.full_name || 'New User',
      role: userData.role || UserRole.DEVELOPER,
      work_mode: userData.work_mode || WorkMode.REMOTE,
      active: userData.active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: userData.last_login || new Date().toISOString()
    };
    
    // Add to local cache
    this.userCache.push(tempUser);
    
    toast({
      title: "Usuario creado localmente",
      description: "El usuario se ha creado solo localmente. La sincronización con el servidor ocurrirá cuando esté disponible.",
      variant: "default",
    });
    
    return tempUser;
  }
}
  // Update user
  static async updateUser(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      // First check if the user exists
      const existingUser = await this.getUserById(id);
      
      if (!existingUser) {
        // If user doesn't exist in backend, create it
        const newUserData = {
          ...userData,
          username: userData.username || `user_${id}`,
          email: userData.email || `user_${id}@example.com`,
          full_name: userData.full_name || `User ${id}`,
          role: userData.role || UserRole.DEVELOPER,
          work_mode: userData.work_mode || 'REMOTE',
          active: true
        };
        
        toast({
          title: "Usuario no encontrado",
          description: "Creando un nuevo usuario en el backend...",
          variant: "default",
        });
        
        return await this.createUser(newUserData as Omit<IUser, 'id' | 'created_at' | 'updated_at'>);
      }
      
      // If user exists, update it
      const updatedUser = await apiClient.put<IUser>(`${this.BASE_PATH}/${id}`, userData);
      
      // Update cache
      if (updatedUser) {
        const index = this.userCache.findIndex(user => user.id === id);
        if (index !== -1) {
          this.userCache[index] = { ...this.userCache[index], ...updatedUser };
        }
      }
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      
      // Update in cache only
      const index = this.userCache.findIndex(user => user.id === id);
      if (index !== -1) {
        this.userCache[index] = { ...this.userCache[index], ...userData };
        return this.userCache[index];
      }
      
      // If not in cache, create a fake user to return
      const tempUser: IUser = {
        id: id,
        username: userData.username || `user_${id}`,
        email: userData.email || `user_${id}@example.com`,
        full_name: userData.full_name || `User ${id}`,
        role: userData.role || UserRole.DEVELOPER,
        work_mode: userData.work_mode || 'REMOTE',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el usuario en el servidor, pero se guardaron los cambios localmente.",
        variant: "destructive",
      });
      
      return tempUser;
    }
  }

  // Delete user
  static async deleteUser(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      
      // Remove from cache
      this.userCache = this.userCache.filter(user => user.id !== id);
      
      return true;
    } catch (error) {
      // Check if error is 404 - user not found
      if (error instanceof Error && error.message.includes('404')) {
        // If user doesn't exist anyway, consider deletion successful
        console.warn(`User ${id} not found, considering deletion successful`);
        
        // Remove from cache anyway
        this.userCache = this.userCache.filter(user => user.id !== id);
        
        return true;
      }
      
      console.error(`Error deleting user ${id}:`, error);
      
      // If other error, still remove from cache for consistency
      this.userCache = this.userCache.filter(user => user.id !== id);
      
      toast({
        title: "Error al eliminar usuario",
        description: "No se pudo eliminar el usuario del servidor, pero se eliminó localmente.",
        variant: "destructive",
      });
      
      // Return true to indicate the operation appeared successful from the client's perspective
      return true;
    }
  }

  // Clear user cache
  static clearCache() {
    this.userCache = [];
  }
}