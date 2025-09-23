'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-krakens-dark shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/Krakens-Logo-transparent.png" 
              alt="Margate Krakens Logo" 
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-white">
              Margate Krakens
            </span>
          </Link>
          
          <div className="flex space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-krakens-yellow text-krakens-dark'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Schedule
            </Link>
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/admin'
                  ? 'bg-krakens-yellow text-krakens-dark'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
