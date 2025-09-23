import { dbOperations } from '@/lib/database';
import { Game } from '@/types';
import ScheduleView from '@/components/ScheduleView';

export default async function Home() {
  const games = dbOperations.getAllGames();

  return (
    <main className="min-h-screen bg-gradient-to-br from-krakens-yellow to-krakens-pink">
      <div className="container mx-auto px-4 py-8">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-8">
            <img 
              src="/Krakens-Logo-transparent.png" 
              alt="Margate Krakens Logo" 
              className="h-40 w-auto"
            />
            <div>
              <h1 className="text-5xl font-black text-white mb-1 font-orbitron tracking-wider">
                SQUID GAMES
              </h1>
              <p className="text-white/90 text-lg font-medium">
                11th October 2025
              </p>
            </div>
          </div>
        </div>
        
        <ScheduleView games={games} />
      </div>
    </main>
  );
}
