'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Header } from '@/components/Header';

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
          if (Array.isArray(data)) {
             // Sort bets by race date (ascending: oldest races first)
             data.sort((a, b) => {
               const dateA = new Date(a.race?.date || 0).getTime();
               const dateB = new Date(b.race?.date || 0).getTime();
               return dateA - dateB;
             });
             setBets(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === 'loading') return null;

  return (
    <main className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans">
      <Header />
      
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">{t.navMyBets || "Minhas Apostas"}</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-xl">Histórico de seus palpites feitos nesta temporada. Acompanhe os resultados e os pontos ganhos.</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-red-900/30 to-red-600/10 border border-red-500/20 rounded-xl">
             <span className="text-xs uppercase font-bold text-red-500 mr-2">Total de Palpites</span>
             <span className="text-xl font-black text-white">{bets.length}</span>
          </div>
        </div>

        {loading ? (
           <div className="space-y-4">
             {[1,2,3].map(i => (
               <div key={i} className="h-40 bg-[#16161a] rounded-2xl animate-pulse"></div>
             ))}
           </div>
        ) : bets.length === 0 ? (
           <div className="py-20 text-center rounded-3xl bg-[#16161a] border border-white/5">
             <div className="text-5xl mb-4 opacity-50">🏎️</div>
             <p className="text-xl text-gray-300 font-semibold mb-2">Sem apostas registradas.</p>
             <p className="text-gray-500 text-sm">Vá até o Dashboard e faça seu primeiro palpite!</p>
             <button onClick={() => router.push('/dashboard')} className="mt-6 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-full font-bold transition shadow-lg text-sm">
               Ir para Dashboard
             </button>
           </div>
        ) : (
          <div className="grid gap-6">
            {bets.map((bet) => {
              const race = bet.race;
              const dateObj = race?.date ? new Date(race.date) : new Date();
              const isPast = dateObj < new Date();

              return (
                <div key={bet._id} className="relative overflow-hidden rounded-2xl bg-[#16161a] shadow-lg border border-white/5 flex flex-col md:flex-row group">
                   <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-600"></div>
                   
                   {/* Info Race */}
                   <div className="p-6 flex-1 md:border-r border-white/5 bg-[#1a1a20]">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">R {race?.round || '-'}</span>
                       <span className="text-xs text-gray-500 font-mono">
                         {dateObj.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                       </span>
                     </div>
                     <h3 className="text-xl font-bold text-white leading-tight">{race?.name || 'Unknown Race'}</h3>
                     <p className="text-sm text-gray-400 mt-1">{race?.circuit}</p>
                     
                     <div className="mt-4">
                        {isPast ? (
                           <span className="inline-block px-3 py-1 bg-gray-500/10 text-gray-300 text-xs font-semibold rounded-full border border-gray-500/20">
                             Corrida Encerrada
                           </span>
                        ) : (
                           <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                             Palpite Ativo
                           </span>
                        )}
                     </div>
                   </div>

                   {/* Predictions */}
                   <div className="flex-1 p-6 bg-[#16161a] grid grid-rows-3 gap-3">
                      <div className="flex items-center gap-4 bg-[#1f1f26] px-4 py-2 rounded-xl">
                        <span className="text-xl">🥇</span>
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block">Vencedor ({t.select1st})</span>
                          <span className="font-bold text-white">{bet.prediction?.first || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#1f1f26] px-4 py-2 rounded-xl">
                        <span className="text-xl opacity-80">🥈</span>
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block">2º Lugar</span>
                          <span className="font-bold text-gray-200">{bet.prediction?.second || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#1f1f26] px-4 py-2 rounded-xl">
                        <span className="text-xl opacity-60">🥉</span>
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 block">3º Lugar</span>
                          <span className="font-bold text-yellow-700">{bet.prediction?.third || '-'}</span>
                        </div>
                      </div>
                   </div>

                   {/* Points Result */}
                   <div className="p-6 md:w-32 flex flex-col justify-center items-center bg-[#111115] border-l border-white/5">
                      <span className="text-xs tracking-widest text-gray-500 font-bold uppercase mb-1">Pontos</span>
                      <span className={`text-4xl font-black ${bet.points > 0 ? 'text-green-500' : 'text-gray-400'}`}>
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
