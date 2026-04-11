'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Header } from '@/components/Header';

export default function RankingPage() {
  const { t } = useLanguage();
  const [rankedUsers, setRankedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranking')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRankedUsers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans">
      <Header />
      
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-white tracking-tight">{t.rankingPlayers || "Ranking"}</h2>
          <p className="text-gray-400 mt-2 text-lg">Top prognosticators of the season</p>
        </div>

        <div className="rounded-3xl bg-[#16161a] border border-white/5 shadow-2xl p-6 md:p-10">
          {loading ? (
             <p className="text-center text-gray-500 py-10 animate-pulse">{t.loading}</p>
          ) : rankedUsers.length === 0 ? (
             <p className="text-center text-gray-500 py-10">No users found.</p>
          ) : (
            <div className="space-y-4">
              {rankedUsers.map((u, i) => {
                const isTop1 = i === 0;
                const isTop2 = i === 1;
                const isTop3 = i === 2;
                const isTop10 = i < 10;
                
                return (
                  <div key={u._id} className={`flex items-center justify-between p-4 md:p-6 rounded-2xl transition hover:bg-[#1f1f26] border ${isTop1 ? 'border-yellow-500/30 bg-yellow-500/5' : isTop2 ? 'border-gray-400/20 bg-gray-400/5' : isTop3 ? 'border-yellow-700/30 bg-yellow-700/5' : 'border-transparent bg-[#1f1f23]'}`}>
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full font-black text-lg md:text-xl ${isTop1 ? 'bg-yellow-500 text-yellow-900' : isTop2 ? 'bg-gray-300 text-gray-900' : isTop3 ? 'bg-yellow-700 text-white' : 'bg-[#2a2a30] text-gray-400'}`}>
                        {i + 1}
                      </div>

                      <div className="flex items-center gap-4">
                        {isTop10 && (
                          <div className="h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-full border border-white/10 shrink-0 bg-gray-800 hidden sm:block">
                            <img 
                              src={u.photo ? u.photo : `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name}&backgroundColor=transparent`} 
                              alt={u.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold ${isTop1 ? 'text-yellow-400 md:text-xl' : isTop2 ? 'text-gray-300 md:text-lg' : isTop3 ? 'text-yellow-600 md:text-lg' : 'text-white md:text-lg'}`}>
                            {u.name}
                          </p>
                          {isTop1 && <p className="text-xs text-yellow-500/70 font-bold uppercase tracking-wider">Championship Leader</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                       <span className={`font-mono font-black ${isTop1 ? 'text-3xl text-yellow-400' : 'text-2xl text-white'}`}>
                         {u.points}
                       </span>
                       <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
