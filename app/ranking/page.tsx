'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Header } from '@/components/Header';

interface User {
  _id: string;
  name: string;
  points: number;
  photo?: string;
}

interface Driver {
  position: string;
  points: string;
  name: string;
  team: string;
  code: string;
  nationality?: string;
}

interface Constructor {
  position: string;
  points: string;
  name: string;
  nationality: string;
  code: string;
  nationality?: string;
}


const getFlagEmoji = (nationality: string | undefined): string => {
  if (!nationality) return "";
  const map: Record<string, string> = {
    "British": "🇬🇧", "Brazilian": "🇧🇷", "Dutch": "🇳🇱", "Monegasque": "🇲🇨",
    "Spanish": "🇪🇸", "German": "🇩🇪", "Mexican": "🇲🇽", "Australian": "🇦🇺",
    "French": "🇫🇷", "Canadian": "🇨🇦", "Japanese": "🇯🇵", "Thai": "🇹🇭",
    "Chinese": "🇨🇳", "American": "🇺🇸", "Italian": "🇮🇹", "Austrian": "🇦🇹",
    "Swiss": "🇨🇭", "Finnish": "🇫🇮", "Danish": "🇩🇰", "New Zealander": "🇳🇿",
    "Monégasque": "🇲🇨"
  };
  return map[nationality] || "🏁";
};

export default function RankingPage() {
  const { t } = useLanguage();
  const [rankedUsers, setRankedUsers] = useState<User[]>([]);
  const [driverStandings, setDriverStandings] = useState<Driver[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<Constructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'drivers' | 'constructors'>('users');

  useEffect(() => {
    Promise.all([
      fetch('/api/ranking').then(r => r.json()),
      fetch('/api/f1-standings').then(r => r.json()),
      fetch('/api/f1-constructors').then(r => r.json())
    ]).then(([users, drivers, constructors]) => {
      if (Array.isArray(users)) setRankedUsers(users);
      if (Array.isArray(drivers)) setDriverStandings(drivers);
      if (Array.isArray(constructors)) setConstructorStandings(constructors);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[100svh] bg-[#0f0f13] text-gray-100 font-sans">
      <Header />
      
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            Rankings <span className="text-red-600">Provisórios</span>
          </h1>
          <p className="text-gray-400 mt-2 text-xs md:text-sm uppercase tracking-widest font-bold">
            Disputa mundial vs Disputa local
          </p>
        </div>

        {/* Tab selection for mobile */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6 lg:hidden">
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase italic transition ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
                {t.navRanking || 'Bolão'}
            </button>
            <button 
                onClick={() => setActiveTab('drivers')}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase italic transition ${activeTab === 'drivers' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
                Drivers
            </button>
            <button 
                onClick={() => setActiveTab('constructors')}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase italic transition ${activeTab === 'constructors' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
                Teams
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Rankings */}
          <div className={`${activeTab === 'users' ? 'block' : 'hidden'} lg:block`}>
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-black uppercase italic text-white tracking-tight">🏆 Bolão</h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{rankedUsers.length} Participantes</span>
            </div>
            
            <div className="space-y-2">
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
              ) : rankedUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-[#16161a] rounded-2xl border border-white/5">Nenhum usuário encontrado.</p>
              ) : (
                rankedUsers.map((u, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div key={u._id} className={`flex items-center justify-between p-3 rounded-xl transition border overflow-hidden relative ${isTop3 ? 'bg-red-600/10 border-red-500/20 shadow-lg' : 'bg-[#16161a] border-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-center font-mono font-black text-sm italic ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-yellow-700' : 'text-gray-500'}`}>
                          {i + 1}
                        </span>
                        
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 shrink-0 bg-[#2a2a30]">
                          <img 
                            src={u.photo ? u.photo : `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name}&backgroundColor=transparent`} 
                            alt={u.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <p className={`font-black uppercase italic ${isTop3 ? 'text-white text-xs' : 'text-gray-300 text-xs'}`}>
                            {u.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                         <span className="font-mono font-black text-lg italic text-white">{u.points}</span>
                         <span className="text-[7px] uppercase tracking-widest text-gray-500 font-bold leading-none">PTS</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real Driver Standings */}
          <div className={`${activeTab === 'drivers' ? 'block' : 'hidden'} lg:block`}>
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-black uppercase italic text-white tracking-tight">🏎 Pilotos</h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">F1 Official {new Date().getFullYear()}</span>
            </div>

            <div className="space-y-2">
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
              ) : driverStandings.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-[#16161a] rounded-2xl border border-white/5 font-black uppercase italic">Falha ao carregar.</p>
              ) : (
                driverStandings.map((d, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div key={d.code} className={`flex items-center justify-between p-3 rounded-xl transition border overflow-hidden relative ${isTop3 ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-[#16161a] border-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 text-center font-mono font-black text-xs italic ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-yellow-700' : 'text-gray-500'}`}>
                          {d.position}
                        </span>
                        
                        <div className="h-7 w-7 overflow-hidden rounded bg-[#2a2a30] p-1 border border-white/5 flex items-center justify-center font-black text-[9px] text-gray-400 shrink-0">
                           {d.code}
                        </div>
                        
                        <div className="min-w-0">
                          <p className={`font-black uppercase italic truncate ${isTop3 ? 'text-white text-xs' : 'text-gray-300 text-xs'}`}>
                            {getFlagEmoji(d.nationality)} {d.name}
                          </p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter truncate">{d.team.split(' ')[0]}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                         <span className="font-mono font-black text-lg italic text-white">{d.points}</span>
                         <span className="text-[7px] uppercase tracking-widest text-gray-500 font-bold leading-none">PTS</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real Constructor Standings */}
          <div className={`${activeTab === 'constructors' ? 'block' : 'hidden'} lg:block`}>
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-black uppercase italic text-white tracking-tight">🛠 Equipes</h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">F1 Official {new Date().getFullYear()}</span>
            </div>

            <div className="space-y-2">
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)
              ) : constructorStandings.length === 0 ? (
                <p className="text-center text-gray-500 py-10 bg-[#16161a] rounded-2xl border border-white/5 font-black uppercase italic">Falha ao carregar.</p>
              ) : (
                constructorStandings.map((c, i) => {
                  const isTop3 = i < 3;
                  return (
                    <div key={c.code} className={`flex items-center justify-between p-3 rounded-xl transition border overflow-hidden relative ${isTop3 ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-[#16161a] border-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 text-center font-mono font-black text-xs italic ${i === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {c.position}
                        </span>
                        
                        <div className="h-7 w-7 overflow-hidden rounded bg-black/40 p-1 border border-white/5 flex items-center justify-center font-black text-[9px] text-red-600 shrink-0 uppercase italic">
                           {c.name.substring(0, 3)}
                        </div>
                        
                        <div className="min-w-0">
                          <p className={`font-black uppercase italic truncate ${isTop3 ? 'text-white text-xs' : 'text-gray-300 text-xs'}`}>
                            {getFlagEmoji(c.nationality)} {c.name}
                          </p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter truncate">{c.nationality}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                         <span className="font-mono font-black text-lg italic text-white">{c.points}</span>
                         <span className="text-[7px] uppercase tracking-widest text-gray-500 font-bold leading-none">PTS</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
