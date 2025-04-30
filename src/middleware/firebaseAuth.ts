// src/middleware/firebaseAuth.ts
import { getAuth } from 'firebase/auth';
import { apiClient } from '@/services/api/apiClient';

/**
 * Middleware to handle Firebase authentication for API requests
 * This adds the Firebase ID token to all outgoing API requests
 */
export async function setupFirebaseAuthMiddleware() {
  const auth = getAuth();
  
  // Listen for auth state changes
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        // Get the user's ID token
        const token = await user.getIdToken();
        
        // Set the token in the API client
        apiClient.setAuthToken(token);
        
        console.log('Firebase auth token set for API requests');
      } catch (error) {
        console.error('Error getting Firebase ID token:', error);
        
        // Clear the auth token if there's an error
        apiClient.clearAuthToken();
      }
    } else {
      // User is signed out, clear the auth token
      apiClient.clearAuthToken();
      
      console.log('Firebase auth token cleared for API requests');
    }
  });
}

/**
 * Manually refresh the Firebase auth token for API requests
 * This can be used when the token might be expired
 */
export async function refreshAuthToken(): Promise<boolean> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.warn('No user is signed in, cannot refresh token');
    return false;
  }
  
  try {
    // Force token refresh
    await auth.currentUser?.getIdToken(true);
    
    // Get the refreshed token
    const token = await user.getIdToken();
    
    // Set the refreshed token in the API client
    apiClient.setAuthToken(token);
    
    console.log('Firebase auth token refreshed for API requests');
    return true;
  } catch (error) {
    console.error('Error refreshing Firebase ID token:', error);
    return false;
  }
}

const firebaseAuthMiddleware = {
  setupFirebaseAuthMiddleware,
  refreshAuthToken,
};

export default firebaseAuthMiddleware;