'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RaceDetails {
  race: {
    round: number;
    name: string;
    date: string;
    time?: string;
    circuit: string;
  };
  realResults: {
    position: string;
    driver: string;
    points: string;
  }[];
  bets: {
    _id: string;
    userName: string;
    prediction: { first: string; second: string; third: string };
    points: number;
    createdAt: string;
  }[];
}

export default function ResultadosPage({ params }: { params: { round: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<RaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/races/${params.round}/details`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setError('Failed to fetch race details');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.round, session, status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading race details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center text-white">
        <p className="text-red-400 mb-4">{error || 'Race not found'}</p>
        <Link href="/" className="rounded bg-white/10 px-4 py-2 hover:bg-white/20">Go Back</Link>
      </div>
    );
  }

  const { race, realResults, bets } = data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <header className="border-b border-red-600/40 bg-black/70 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-lg font-bold">F1</div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Race Results Dashboard</h1>
              <p className="text-xs text-gray-300">Round {race.round}</p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Race Information Header */}
        <div className="text-center md:text-left bg-gradient-to-r from-red-900/40 to-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-20"></div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {race.name}
          </h2>
          <p className="text-lg text-red-200 mt-2">{race.circuit}</p>
          <p className="text-gray-400 mt-1">
            {new Date(race.time ? `${race.date.split('T')[0]}T${race.time}` : race.date).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Official Podium Card */}
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 flex.items-center gap-2">
              <span className="text-yellow-500">🏆</span> Official Podium
            </h3>
            {realResults && realResults.length > 0 ? (
              <ul className="w-full space-y-4">
                {realResults.map((r, i) => (
                  <li key={i} className={`rounded-xl border ${i === 0 ? 'border-yellow-500/50 bg-yellow-500/10' : i === 1 ? 'border-gray-300/50 bg-gray-300/10' : 'border-amber-700/50 bg-amber-700/10'} p-4 flex justify-between items-center`}>
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-300' : 'text-amber-700'}`}>
                        P{r.position}
                      </span>
                      <span className="font-semibold">{r.driver}</span>
                    </div>
                    <span className="text-sm font-bold opacity-80">{r.points} pts</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 opacity-60">
                <p>No official results yet.</p>
                <p className="text-sm">Check back after the race.</p>
              </div>
            )}
          </div>

          {/* User Bets Table */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
             <h3 className="text-xl font-bold mb-6">User Predictions</h3>
             
             {bets && bets.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs uppercase bg-black/40 text-gray-400 border-b border-white/10">
                     <tr>
                       <th className="px-4 py-3 rounded-tl-lg">User</th>
                       <th className="px-4 py-3">Winner (P1)</th>
                       <th className="px-4 py-3">2nd Place (P2)</th>
                       <th className="px-4 py-3">3rd Place (P3)</th>
                       <th className="px-4 py-3 text-right rounded-tr-lg">Points</th>
                     </tr>
                   </thead>
                   <tbody>
                     {bets.map((bet) => (
                       <tr key={bet._id} className="border-b border-white/5 hover:bg-white/5 transition">
                         <td className="px-4 py-4 font-semibold text-white">{bet.userName}</td>
                         <td className="px-4 py-4 text-gray-300">{bet.prediction.first}</td>
                         <td className="px-4 py-4 text-gray-300">{bet.prediction.second}</td>
                         <td className="px-4 py-4 text-gray-300">{bet.prediction.third}</td>
                         <td className="px-4 py-4 text-right">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${bet.points > 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                             +{bet.points} pts
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="text-center py-12 text-gray-400 bg-black/20 rounded-xl border border-white/5">
                 <p className="mb-2">No bets have been placed for this race yet.</p>
               </div>
             )}
          </div>
        </div>
      </section>
    </main>
  );
}
