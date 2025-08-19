import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: AuthUser = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
    return { success: true };
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: AuthUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsLoading(false);
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
};