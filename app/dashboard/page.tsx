'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Race {
  round: number;
  name: string;
  date: string;
  time?: string;
  circuit: string;
  season: number;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
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
    const loadRaces = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/races');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setRaces(data);
        } else {
          setRaces([]);
          setError(data?.error || 'Falha ao carregar corridas.');
        }
      } catch (err) {
        setRaces([]);
        setError('Erro de rede ao carregar corridas.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDrivers = async () => {
      try {
        // Try to fetch from driver standings which includes constructor info
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        if (!res.ok) throw new Error('Failed to fetch driver standings');
        
        const data = await res.json();
        
        if (!data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings) {
          throw new Error('Invalid driver standings data structure');
        }
        
        const driverList = data.MRData.StandingsTable.StandingsLists[0].DriverStandings
          .map((standing: any) => ({
            name: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
            team: standing.Constructors?.[0]?.name || 'Unknown Team'
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        if (driverList.length > 0) {
          setDrivers(driverList);
        } else {
          throw new Error('No drivers found');
        }
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
        // Fallback drivers with correct teams
        const fallbackDrivers = [
          { name: 'Alexander Albon', team: 'Williams' },
          { name: 'Andrea Kimi Antonelli', team: 'Mercedes' },
          { name: 'Arvid Lindblad', team: 'Kick Sauber' },
          { name: 'Carlos Sainz', team: 'Ferrari' },
          { name: 'Charles Leclerc', team: 'Ferrari' },
          { name: 'Esteban Ocon', team: 'Haas' },
          { name: 'Fernando Alonso', team: 'Aston Martin' },
          { name: 'Franco Colapinto', team: 'Williams' },
          { name: 'Gabriel Bortoleto', team: 'Aston Martin' },
          { name: 'George Russell', team: 'Mercedes' },
          { name: 'Isack Hadjar', team: 'Alpine' },
          { name: 'Lance Stroll', team: 'Aston Martin' },
          { name: 'Lewis Hamilton', team: 'Mercedes' },
          { name: 'Liam Lawson', team: 'Racing Bulls' },
          { name: 'Lando Norris', team: 'McLaren' },
          { name: 'Max Verstappen', team: 'Red Bull Racing' },
          { name: 'Nico Hülkenberg', team: 'Haas' },
          { name: 'Oliver Bearman', team: 'Ferrari' },
          { name: 'Oscar Piastri', team: 'McLaren' },
          { name: 'Pierre Gasly', team: 'Alpine' },
          { name: 'Sergio Pérez', team: 'Red Bull Racing' },
          { name: 'Valtteri Bottas', team: 'Kick Sauber' },
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
          const visitData = await visitRes.json();
          setVisits(visitData.visits);
        } else if (!visitRes) {
          const res = await fetch('/api/visits');
          if (res.ok) {
             const data = await res.json();
             setVisits(data.visits);
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };

    loadRaces();
    fetchDrivers();
    initializeSettings();
  }, []);

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
      fetch('/api/bets')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setUserBets(data);
        })
        .catch(console.error);
      return;
    }

    const data = await res.json().catch(() => null);
    alert(data?.error || 'Failed to place bet');
  };

  const handleViewResults = (round: number) => {
    router.push(`/resultados/${round}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <header className="border-b border-red-600/40 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-lg font-bold">F1</div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">F1 Bolão</h1>
              <p className="text-xs text-gray-300">Predict the podium and earn points</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-gray-200">Hello, {session.user?.name}</span>
                {(session.user as any)?.isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="rounded-full bg-yellow-600 px-4 py-2 text-sm font-semibold transition hover:bg-yellow-500"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => signOut()}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Active Grand Prix</h2>
            <p className="text-sm text-gray-300">Choose your podium finishers before the race starts.</p>
          </div>
          <div className="hidden items-center gap-3 text-sm text-gray-300 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Upcoming
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Finished
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">Loading races...</div>
          ) : error ? (
            <div className="col-span-full rounded-xl border border-red-600/40 bg-white/5 p-8 text-center text-red-200">{error}</div>
          ) : races.length === 0 ? (
            <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">No races found.</div>
          ) : (
            races.map(race => {
              const raceDateTime = new Date(race.time ? `${race.date}T${race.time}` : `${race.date}T15:00:00Z`);
              const isPast = raceDateTime < new Date();
              const isLocked = new Date(raceDateTime.getTime() - betLockHours * 3600 * 1000) <= new Date();

              return (
                <div
                  key={race.round}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-white to-red-500" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-300">Round {race.round}</p>
                      <h3 className="mt-2 text-xl font-bold text-white">{race.name}</h3>
                      <p className="mt-1 text-sm text-gray-300">{race.circuit}</p>
                      <p className="mt-1 text-sm text-gray-400">{raceDateTime.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {session ? (
                        !isLocked ? (
                          <button
                            onClick={() => handleOpenBetModal(race)}
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-500"
                          >
                            Place/Update Bet
                          </button>
                        ) : (
                          <button
                            onClick={isPast ? () => handleViewResults(race.round) : undefined}
                            disabled={!isPast}
                            className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow ${isPast ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-600/50 cursor-not-allowed text-gray-400'}`}
                          >
                            {isPast ? 'View Results' : 'Bets Locked'}
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => router.push('/login')}
                          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-500"
                        >
                          Login to Bet
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/80 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Bet on {selectedRace.name}</h2>
              <button
                onClick={() => setSelectedRace(null)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <select
                value={prediction.first}
                onChange={(e) => setPrediction({ ...prediction, first: e.target.value })}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                required
              >
                <option value="">Select 1st Place Driver</option>
                {drivers.map(driver => (
                  <option key={driver.name} value={driver.name}>
                    {driver.name} ({driver.team})
                  </option>
                ))}
              </select>

              <select
                value={prediction.second}
                onChange={(e) => setPrediction({ ...prediction, second: e.target.value })}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                required
              >
                <option value="">Select 2nd Place Driver</option>
                {drivers.map(driver => (
                  <option key={driver.name} value={driver.name}>
                    {driver.name} ({driver.team})
                  </option>
                ))}
              </select>

              <select
                value={prediction.third}
                onChange={(e) => setPrediction({ ...prediction, third: e.target.value })}
                className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                required
              >
                <option value="">Select 3rd Place Driver</option>
                {drivers.map(driver => (
                  <option key={driver.name} value={driver.name}>
                    {driver.name} ({driver.team})
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleBet}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-red-500"
                >
                  Submit Bet
                </button>
                <button
                  onClick={() => setSelectedRace(null)}
                  className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 border-t border-red-600/20 py-6 text-center text-sm text-gray-400 backdrop-blur-md">
        <p>Acessos totais: {visits !== null ? visits : '...'}</p>
      </footer>
    </main>
  );
}