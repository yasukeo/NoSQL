'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export function useAuth(requiredRole?: 'admin' | 'client') {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          
          // Vérifier le rôle si requis
          if (requiredRole && parsedUser.role !== requiredRole) {
            // Rediriger vers la page appropriée
            if (parsedUser.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/client');
            }
            return;
          }
          
          setUser(parsedUser);
        } else if (requiredRole) {
          // Si un rôle est requis mais pas d'utilisateur, rediriger vers login
          router.push('/login');
        }
      } catch (error) {
        console.error('Erreur auth:', error);
        localStorage.removeItem('user');
        if (requiredRole) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout };
}
