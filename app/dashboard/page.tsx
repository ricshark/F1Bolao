'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Header } from '@/components/Header';
import Image from 'next/image';

interface Race {
  round: number;
  name: string;
  date: string;
  time?: string;
  circuit: string;
  season: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();
  
  const [races, setRaces] = useState<Race[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [prediction, setPrediction] = useState({ first: '', second: '', third: '' });
  const [userBets, setUserBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<{name: string, team: string}[]>([]);
  const [betLockHours, setBetLockHours] = useState(1);
  const [visits, setVisits] = useState<number | null>(null);
  const hasVisited = useRef(false);

  useEffect(() => {
    if (session) {
      fetch('/api/bets')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUserBets(data);
          }
        })
        .catch(console.error);
    } else {
      setUserBets([]);
    }
  }, [session]);

  useEffect(() => {
    const loadRacesAndRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const [racesRes, rankingRes] = await Promise.all([
          fetch('/api/races'),
          fetch('/api/ranking')
        ]);
        
        const racesData = await racesRes.json();
        if (racesRes.ok && Array.isArray(racesData)) {
          setRaces(racesData);
        } else {
          setRaces([]);
          setError(racesData?.error || t.loadingRaces);
        }

        if (rankingRes.ok) {
          const rankingData = await rankingRes.json();
          setTopUsers(rankingData.slice(0, 6)); // Top 6
        }
      } catch (err) {
        setRaces([]);
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDrivers = async () => {
      try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        if (!res.ok) throw new Error('Failed to fetch driver standings');
        const data = await res.json();
        
        if (!data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings) throw new Error('Invalid structure');
        
        const driverList = data.MRData.StandingsTable.StandingsLists[0].DriverStandings
          .map((standing: any) => ({
            name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
            team: standing.Constructors?.[0]?.name || 'Unknown Team'
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        if (driverList.length > 0) setDrivers(driverList);
        else throw new Error('No drivers found');
      } catch (error) {
        const fallbackDrivers = [
          { name: 'Alexander Albon', team: 'Williams' }, { name: 'Andrea Kimi Antonelli', team: 'Mercedes' },
          { name: 'Arvid Lindblad', team: 'Kick Sauber' }, { name: 'Carlos Sainz', team: 'Ferrari' },
          { name: 'Charles Leclerc', team: 'Ferrari' }, { name: 'Esteban Ocon', team: 'Haas' },
          { name: 'Fernando Alonso', team: 'Aston Martin' }, { name: 'Franco Colapinto', team: 'Williams' },
          { name: 'Gabriel Bortoleto', team: 'Aston Martin' }, { name: 'George Russell', team: 'Mercedes' },
          { name: 'Isack Hadjar', team: 'Alpine' }, { name: 'Lance Stroll', team: 'Aston Martin' },
          { name: 'Lewis Hamilton', team: 'Mercedes' }, { name: 'Liam Lawson', team: 'Racing Bulls' },
          { name: 'Lando Norris', team: 'McLaren' }, { name: 'Max Verstappen', team: 'Red Bull Racing' },
          { name: 'Nico Hülkenberg', team: 'Haas' }, { name: 'Oliver Bearman', team: 'Ferrari' },
          { name: 'Oscar Piastri', team: 'McLaren' }, { name: 'Pierre Gasly', team: 'Alpine' },
          { name: 'Sergio Pérez', team: 'Red Bull Racing' }, { name: 'Valtteri Bottas', team: 'Kick Sauber' },
        ];
        setDrivers(fallbackDrivers);
      }
    };

    const initializeSettings = async () => {
      try {
        const [settingsRes, visitRes] = await Promise.all([
          fetch('/api/settings'),
          hasVisited.current ? Promise.resolve(null) : fetch('/api/visits', { method: 'POST' })
        ]);
        hasVisited.current = true;
        if (settingsRes.ok) {
          const configData = await settingsRes.json();
          setBetLockHours(configData.betLockHours || 1);
        }
        if (visitRes && visitRes.ok) {
          setVisits((await visitRes.json()).visits);
        } else if (!visitRes) {
          const res = await fetch('/api/visits');
          if (res.ok) setVisits((await res.json()).visits);
        }
      } catch (err) {}
    };

    loadRacesAndRanking();
    fetchDrivers();
    initializeSettings();
  }, [t.loadingRaces]);

  const handleOpenBetModal = (race: Race) => {
    setSelectedRace(race);
    const existingBet = userBets.find((b: any) => String(b.race?.round) === String(race.round));
    if (existingBet && existingBet.prediction) {
      setPrediction({
        first: existingBet.prediction.first || '',
        second: existingBet.prediction.second || '',
        third: existingBet.prediction.third || ''
      });
    } else {
      setPrediction({ first: '', second: '', third: '' });
    }
  };

  const handleBet = async () => {
    if (!selectedRace) return;
    const res = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round: selectedRace.round, prediction }),
    });

    if (res.ok) {
      alert('Bet placed!');
      setSelectedRace(null);
      setPrediction({ first: '', second: '', third: '' });
      fetch('/api/bets').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setUserBets(data);
      }).catch(console.error);
      return;
    }
    const data = await res.json().catch(() => null);
    alert(data?.error || 'Failed to place bet');
  };

  const raceAssets: Record<string, { city: string; flag: string }> = {
    'Bahrain': { city: 'bahrain,landscape', flag: 'bh' },
    'Saudi Arabian': { city: 'jeddah,city', flag: 'sa' },
    'Australian': { city: 'melbourne,landscape', flag: 'au' },
    'Japanese': { city: 'japan,fuji', flag: 'jp' },
    'Chinese': { city: 'shanghai,city', flag: 'cn' },
    'Miami': { city: 'miami,beach', flag: 'us' },
    'Emilia Romagna': { city: 'italy,landscape', flag: 'it' },
    'Monaco': { city: 'monaco,city', flag: 'mc' },
    'Canadian': { city: 'montreal,city', flag: 'ca' },
    'Spanish': { city: 'barcelona,city', flag: 'es' },
    'Spain': { city: 'barcelona,city', flag: 'es' },
    'Barcelona': { city: 'barcelona,city', flag: 'es' },
    'Austrian': { city: 'austria,landscape', flag: 'at' },
    'British': { city: 'london,landmark', flag: 'gb' },
    'Hungarian': { city: 'budapest,city', flag: 'hu' },
    'Belgian': { city: 'belgium,landscape', flag: 'be' },
    'Dutch': { city: 'amsterdam,city', flag: 'nl' },
    'Italian': { city: 'rome,landmark', flag: 'it' },
    'Azerbaijan': { city: 'baku,city', flag: 'az' },
    'Singapore': { city: 'singapore,landscape', flag: 'sg' },
    'United States': { city: 'texas,landscape', flag: 'us' },
    'Mexico City': { city: 'mexico,landmark', flag: 'mx' },
    'Mexico': { city: 'mexico,landmark', flag: 'mx' },
    'São Paulo': { city: 'saopaulo,city', flag: 'br' },
    'Brazilian': { city: 'saopaulo,city', flag: 'br' },
    'Brazil': { city: 'saopaulo,city', flag: 'br' },
    'Las Vegas': { city: 'lasvegas,city', flag: 'us' },
    'Qatar': { city: 'doha,city', flag: 'qa' },
    'Abu Dhabi': { city: 'abudhabi,city', flag: 'ae' }
  };

  const getRaceAsset = (raceName: string) => {
    const foundKey = Object.keys(raceAssets).find(key => raceName.includes(key));
    return foundKey ? raceAssets[foundKey] : { city: 'racing,car', flag: '' };
  };

  return (
    <main className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Content (Left) */}
          <div className="md:col-span-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white">{t.activeGP}</h2>
              <p className="text-sm text-gray-400 mt-1">{t.activeGPDesc}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full rounded-xl border border-white/5 bg-[#16161a] p-8 text-center text-gray-400 animate-pulse">{t.loadingRaces}</div>
              ) : error ? (
                <div className="col-span-full rounded-xl border border-red-900/40 bg-red-900/10 p-8 text-center text-red-400">{error}</div>
              ) : races.length === 0 ? (
                <div className="col-span-full rounded-xl border border-white/5 bg-[#16161a] p-8 text-center text-gray-400">{t.noRaces}</div>
              ) : (
                races.map((race, index) => {
                  const raceDateTime = new Date(race.time ? `${race.date}T${race.time}` : `${race.date}T15:00:00Z`);
                  const isPast = raceDateTime < new Date();
                  const isLocked = new Date(raceDateTime.getTime() - betLockHours * 3600 * 1000) <= new Date();
                  
                  const asset = getRaceAsset(race.name);
                  const bgImage = asset.flag ? `https://flagcdn.com/w640/${asset.flag}.png` : `https://loremflickr.com/600/400/racing,car/all?lock=${race.round}`;

                  return (
                    <div
                      key={race.round}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#16161a] shadow-lg transition-transform hover:-translate-y-1"
                    >
                      {/* Race Image Header */}
                      <div className="relative h-40 w-full overflow-hidden bg-[#242429]">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 z-10" />
                        <img 
                          src={bgImage} 
                          alt={`${race.name} Card`} 
                          loading="lazy"
                          className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-[#16161a]/60 to-transparent" />
                      </div>

                      {/* Race Details */}
                      <div className="flex flex-col flex-1 p-5 -mt-4 relative z-10">
                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{race.name}</h3>
                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                          <span className="font-mono">{raceDateTime.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </p>
                        
                        <div className="mt-auto pt-6 w-full">
                          {session ? (
                            !isLocked ? (
                              <button
                                onClick={() => handleOpenBetModal(race)}
                                className="w-full rounded-lg bg-red-700 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-600 transition"
                              >
                                {t.placeOrUpdate}
                              </button>
                            ) : (
                              <button
                                onClick={isPast ? () => router.push(`/resultados/${race.round}`) : undefined}
                                disabled={!isPast}
                                className={`w-full rounded-lg py-2.5 text-sm font-bold shadow-md transition ${isPast ? 'bg-[#303036] text-white hover:bg-gray-600' : 'bg-[#1f1f23] text-gray-500 cursor-not-allowed'}`}
                              >
                                {isPast ? t.viewResults : t.betsLocked}
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => router.push('/login')}
                              className="w-full rounded-lg bg-red-700 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-600 transition"
                            >
                              {t.loginToBet}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Player Ranking Widget */}
            <div className="rounded-2xl bg-[#16161a] shadow-lg overflow-hidden border border-white/5">
              <div className="p-5 border-b border-white/5">
                <h3 className="font-bold text-lg text-white">{t.rankingPlayers}</h3>
              </div>
              <div className="p-3">
                {topUsers.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">{t.loading}</p>
                ) : (
                  <ul className="space-y-2">
                    {topUsers.map((u, i) => {
                      const isTop3 = i < 3;
                      return (
                        <li key={u._id} className={`flex items-center justify-between p-3 rounded-xl transition ${isTop3 ? 'bg-[#1f1f26]' : 'bg-transparent'}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-6 text-center font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-yellow-700' : 'text-gray-500'}`}>
                              {i + 1}
                            </span>
                            {isTop3 && (
                              <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 shrink-0 bg-[#1f1f26]">
                                <img 
                                  src={u.photo ? u.photo : `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name}&backgroundColor=transparent`} 
                                  alt={u.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <span className={`font-semibold ${isTop3 ? 'text-white text-sm' : 'text-gray-300 text-sm'}`}>
                              {u.name.split(' ')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isTop3 && <span className="text-xl">🏆</span>}
                            <span className="font-mono text-sm font-bold text-white">{u.points}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Alexa Skill Banner */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0f0f13] to-[#1f1f26] overflow-hidden shadow-lg border border-white/10 relative top-0 hover:-translate-y-1 transition group">
              <div 
                className="absolute inset-0 bg-[url('/logo.png')] opacity-20 mix-blend-screen bg-center bg-no-repeat bg-contain transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                  {/* Alexa Icon mock */}
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                </div>
                <h3 className="text-xl font-black text-white leading-tight mb-2">{t.alexaPromoTitle}</h3>
                <p className="text-gray-300 text-sm font-medium mb-6">
                  {t.alexaPromoDesc}
                </p>
                <div className="mt-auto">
                  <div className="inline-block bg-red-600/20 border border-red-500/30 text-red-500 font-black px-4 py-2 rounded-lg text-xs uppercase tracking-widest shadow-lg animate-pulse">
                    {t.alexaPromoBtn}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bet Modal */}
      {selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#16161a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <span className="text-red-500">🏎</span> {t.betOn} {selectedRace.name}
              </h2>
              <button
                onClick={() => setSelectedRace(null)}
                className="rounded-full bg-white/5 h-8 w-8 flex flex-col items-center justify-center text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                { field: 'first', label: t.select1st, medal: '🥇' },
                { field: 'second', label: t.select2nd, medal: '🥈' },
                { field: 'third', label: t.select3rd, medal: '🥉' }
              ].map(({field, label, medal}) => (
                <div key={field}>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">{medal} {label}</label>
                  <select
                    value={(prediction as any)[field]}
                    onChange={(e) => setPrediction({ ...prediction, [field]: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0f0f13] px-4 py-3 text-sm font-medium text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  >
                    <option value="">{label}</option>
                    {drivers.map(driver => (
                      <option key={driver.name} value={driver.name}>
                        {driver.name} ({driver.team})
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBet}
                  className="flex-1 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-red-600 transition"
                >
                  {t.submitBet}
                </button>
                <button
                  onClick={() => setSelectedRace(null)}
                  className="flex-1 rounded-xl bg-[#1f1f23] border border-white/5 px-4 py-3 text-sm font-bold text-gray-300 shadow-lg hover:bg-[#303036] transition"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 border-t border-white/5 py-8 text-center text-xs font-medium tracking-wide text-gray-500">
        <p>Acessos totais: {visits !== null ? visits : '...'}</p>
      </footer>
    </main>
  );
}