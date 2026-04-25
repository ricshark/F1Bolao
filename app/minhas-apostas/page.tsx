'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Header } from '@/components/Header';

const getFlagEmoji = (nationality: string | undefined): string => {
  if (!nationality) return "";
  const map: Record<string, string> = {
    "British": "🇬🇧", "Brazilian": "🇧🇷", "Dutch": "🇳🇱", "Monegasque": "🇲🇨",
    "Spanish": "🇪🇸", "German": "🇩🇪", "Mexican": "🇲🇽", "Australian": "🇦🇺",
    "French": "🇫🇷", "Canadian": "🇨🇦", "Japanese": "🇯🇵", "Thai": "🇹🇭",
    "Chinese": "CN", "American": "🇺🇸", "Italian": "🇮🇹", "Austrian": "🇦🇹",
    "Swiss": "🇨🇭", "Finnish": "🇫🇮", "Danish": "🇩🇰", "New Zealander": "🇳🇿",
    "Monégasque": "🇲🇨"
  };
  return map[nationality] || "";
};

export default function MyBetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();
  
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetch('/api/bets')
        .then(r => r.json())
        .then(data => {
              // Sort bets by race date safely
              const sorted = [...data].sort((a, b) => {
                const dateA = a.race?.date ? new Date(a.race.date).getTime() : 0;
                const dateB = b.race?.date ? new Date(b.race.date).getTime() : 0;
                return dateB - dateA;
              });
              setBets(sorted);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === 'loading') return null;

  return (
    <main className="min-h-[100svh] bg-[#0f0f13] text-gray-100 font-sans">
      <Header />
      
      <section className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                Meus <span className="text-red-700">Palpites</span>
            </h2>
            <p className="text-gray-400 mt-1 text-[10px] md:text-xs uppercase tracking-widest font-black">Histórico da Temporada</p>
          </div>
          <div className="bg-red-700/10 border border-red-500/20 rounded-lg px-3 py-1 text-center shrink-0">
             <span className="block text-[8px] uppercase font-black text-red-500">Total</span>
             <span className="text-lg font-black text-white italic leading-none">{bets.length}</span>
          </div>
        </div>

        {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse border border-white/5"></div>
              ))}
            </div>
        ) : bets.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#16161a] border border-white/5">
              <p className="text-gray-300 font-black uppercase italic mb-4">Sem apostas registradas.</p>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded-xl font-black uppercase italic transition shadow-lg text-xs"
              >
                Fazer primeiro palpite
              </button>
            </div>
        ) : (
          <div className="space-y-2">
            {bets.map((bet) => {
              const race = bet.race;
              const dateObj = race?.date ? new Date(race.date) : new Date();
              const isPast = dateObj < new Date();

              return (
                <div key={bet._id} className="relative overflow-hidden rounded-xl bg-[#16161a] border border-white/5 flex items-center p-3 gap-3 transition hover:bg-[#1c1c21] group">
                   {/* Left Accent */}
                   <div className={`absolute top-0 bottom-0 left-0 w-1 ${isPast ? 'bg-gray-600' : 'bg-red-600'}`}></div>
                   
                   {/* Date & Round */}
                   <div className="flex flex-col items-center justify-center shrink-0 min-w-[50px] border-r border-white/5 pr-3">
                      <span className="text-[10px] font-black italic text-red-600">R{race?.round || '?'}</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">{dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                   </div>

                   {/* Race Name */}
                   <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-white uppercase italic leading-tight truncate group-hover:text-red-500 transition-colors">
                        {race?.name?.replace('Grand Prix', 'GP') || 'GP Desconhecido'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[9px] text-gray-500 font-bold uppercase truncate">
                           {race?.circuit ? race.circuit.split(',')[0] : 'Circuito'}
                         </span>
                         {isPast ? (
                           <span className="text-[8px] font-black uppercase text-gray-600 bg-white/5 px-1 rounded">Past</span>
                         ) : (
                           <span className="text-[8px] font-black uppercase text-green-500 bg-green-500/10 px-1 rounded">Live</span>
                         )}
                      </div>
                   </div>

                   {/* Predictions */}
                   <div className="flex items-center gap-1 hidden sm:flex">
                        <div className="flex flex-col items-center p-1 bg-white/5 rounded border border-white/10 min-w-[100px]">
                            <span className="text-[7px] text-gray-500 font-black uppercase">P1</span>
                            <span className="text-[10px] font-black text-white truncate max-w-[90px] text-center" title={bet.prediction?.first}>
                                {bet.prediction?.first || '---'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-1 bg-white/5 rounded border border-white/10 min-w-[100px]">
                            <span className="text-[7px] text-gray-500 font-black uppercase">P2</span>
                            <span className="text-[10px] font-black text-gray-300 truncate max-w-[90px] text-center" title={bet.prediction?.second}>
                                {bet.prediction?.second || '---'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center p-1 bg-white/5 rounded border border-white/10 min-w-[100px]">
                            <span className="text-[7px] text-gray-500 font-black uppercase">P3</span>
                            <span className="text-[10px] font-black text-gray-400 truncate max-w-[90px] text-center" title={bet.prediction?.third}>
                                {bet.prediction?.third || '---'}
                            </span>
                        </div>
                   </div>

                   {/* Points Result */}
                   <div className="shrink-0 min-w-[40px] text-center border-l border-white/5 pl-3">
                      <span className="block text-[7px] uppercase font-black text-gray-500">Pts</span>
                      <span className={`text-xl font-black italic ${bet.points > 0 ? 'text-green-500' : 'text-gray-600'}`}>
                        {bet.points ?? '?'}
                      </span>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
