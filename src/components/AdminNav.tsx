'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const { user, loading, logout } = useAuth('admin');
  const pathname = usePathname();

  if (loading) {
    return (
      <nav className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold flex items-center space-x-2">
                <span>✈️</span>
                <span>SkyFlight Admin</span>
              </span>
            </div>
            <div className="animate-pulse bg-purple-600 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return null; // Will redirect in useAuth
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold flex items-center space-x-2">
              <span>✈️</span>
              <span>SkyFlight Admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              href="/admin" 
              className={`px-3 py-2 rounded ${isActive('/admin') ? 'bg-purple-800' : 'hover:bg-purple-600'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/flights" 
              className={`px-3 py-2 rounded ${isActive('/admin/flights') ? 'bg-purple-800' : 'hover:bg-purple-600'}`}
            >
              Vols
            </Link>
            <Link 
              href="/admin/aircraft" 
              className={`px-3 py-2 rounded ${isActive('/admin/aircraft') ? 'bg-purple-800' : 'hover:bg-purple-600'}`}
            >
              Avions
            </Link>
            <Link 
              href="/admin/employees" 
              className={`px-3 py-2 rounded ${isActive('/admin/employees') ? 'bg-purple-800' : 'hover:bg-purple-600'}`}
            >
              Employés
            </Link>
            <Link 
              href="/admin/passengers" 
              className={`px-3 py-2 rounded ${isActive('/admin/passengers') ? 'bg-purple-800' : 'hover:bg-purple-600'}`}
            >
              Passagers
            </Link>
            <Link 
              href="/admin/bookings" 
              className={`px-3 py-2 rounded ${isActive('/admin/bookings') ? 'bg-purple-800' : 'hover:bg-purple-600'}`}
            >
              Réservations
            </Link>
            
            {/* User info & Logout */}
            <div className="border-l border-purple-500 pl-4 ml-2 flex items-center space-x-3">
              <span className="text-purple-200 text-sm">{user.name}</span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
