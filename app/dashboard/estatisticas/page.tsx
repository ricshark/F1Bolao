'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageContext';

interface PilotStat {
    name: string;
    p1: number;
    p2: number;
    p3: number;
    total: number;
}

interface PointEvolution {
    round: number;
    name: string;
    avgPoints: number;
}

interface Comparison {
    type: string;
    avg: number;
    count: number;
}

interface StatsData {
    pilotStats: PilotStat[];
    pointsEvolution: PointEvolution[];
    comparison: Comparison[];
}

export default function StatsPage() {
    const { t } = useLanguage();
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0f0f13] text-white">
                <Header />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className="min-h-screen bg-[#0f0f13] text-gray-100 font-sans pb-20">
            <Header />

            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Análise de Apostas</h2>
                        <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest">Estatísticas detalhadas de todos os palpites</p>
                    </div>

                    <div className="flex bg-[#16161a] p-1 rounded-xl border border-white/5 shadow-inner">
                        <button 
                            onClick={() => setChartType('bar')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${chartType === 'bar' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Pilotos
                        </button>
                        <button 
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${chartType === 'line' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Evolução
                        </button>
                        <button 
                            onClick={() => setChartType('pie')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${chartType === 'pie' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Bots vs Humanos
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Main Chart Card */}
                    <div className="rounded-3xl bg-[#16161a] border border-white/5 p-6 md:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
                        
                        {chartType === 'bar' && (
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic mb-8">Top 10 Pilotos mais Escolhidos (P1)</h3>
                                <div className="space-y-6">
                                    {data.pilotStats.map((stat, i) => {
                                        const max = Math.max(...data.pilotStats.map(s => s.p1));
                                        const percentage = (stat.p1 / max) * 100;
                                        return (
                                            <div key={stat.name} className="group">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{i + 1}. {stat.name}</span>
                                                    <span className="text-xs font-mono font-bold text-red-500">{stat.p1} votos</span>
                                                </div>
                                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {chartType === 'line' && (
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic mb-8">Média de Pontos por Corrida</h3>
                                <div className="h-[400px] w-full relative mt-10">
                                    {/* SVG Line Chart */}
                                    <svg viewBox="0 0 1000 400" className="w-full h-full overflow-visible">
                                        {/* Grid Lines */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                                            <line 
                                                key={p}
                                                x1="0" y1={400 * (1 - p)} x2="1000" y2={400 * (1 - p)} 
                                                stroke="white" strokeOpacity="0.05" strokeWidth="1" 
                                            />
                                        ))}
                                        
                                        {/* Line */}
                                        <polyline
                                            fill="none"
                                            stroke="#dc2626"
                                            strokeWidth="4"
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            points={data.pointsEvolution.map((p, i) => {
                                                const maxPoints = Math.max(...data.pointsEvolution.map(e => e.avgPoints), 25);
                                                const x = (i / (data.pointsEvolution.length - 1)) * 1000;
                                                const y = 400 - (p.avgPoints / maxPoints) * 400;
                                                return `${x},${y}`;
                                            }).join(' ')}
                                            className="drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                                        />
                                        
                                        {/* Data Points */}
                                        {data.pointsEvolution.map((p, i) => {
                                            const maxPoints = Math.max(...data.pointsEvolution.map(e => e.avgPoints), 25);
                                            const x = (i / (data.pointsEvolution.length - 1)) * 1000;
                                            const y = 400 - (p.avgPoints / maxPoints) * 400;
                                            return (
                                                <g key={i} className="group/point cursor-pointer">
                                                    <circle cx={x} cy={y} r="6" fill="#dc2626" />
                                                    <circle cx={x} cy={y} r="12" fill="white" fillOpacity="0" className="hover:fill-opacity-10 transition-all" />
                                                    {/* Tooltip mock */}
                                                    <text x={x} y={y - 20} textAnchor="middle" className="text-[10px] font-mono fill-white opacity-0 group-hover/point:opacity-100 transition-opacity">
                                                        {p.avgPoints} pts
                                                    </text>
                                                    <text x={x} y={420} textAnchor="middle" className="text-[10px] font-bold fill-gray-500 uppercase tracking-tighter">
                                                        R{p.round}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                                <p className="text-center text-[10px] text-gray-500 mt-12 uppercase tracking-widest font-bold">Rodadas do Campeonato</p>
                            </div>
                        )}

                        {chartType === 'pie' && (
                            <div className="flex flex-col items-center">
                                <h3 className="text-xl font-black text-white uppercase italic mb-12 self-start">Distribuição: Bots vs Humanos</h3>
                                
                                <div className="flex flex-col md:flex-row items-center gap-16">
                                    {/* Donut Chart */}
                                    <div className="relative w-64 h-64">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            {(() => {
                                                const total = data.comparison.reduce((acc, c) => acc + c.count, 0);
                                                let currentPercent = 0;
                                                return data.comparison.map((c, i) => {
                                                    const percent = (c.count / total) * 100;
                                                    const dashArray = `${percent} ${100 - percent}`;
                                                    const offset = 100 - currentPercent;
                                                    currentPercent += percent;
                                                    return (
                                                        <circle
                                                            key={i}
                                                            cx="50" cy="50" r="40"
                                                            fill="transparent"
                                                            stroke={i === 0 ? "#dc2626" : "#ffffff"}
                                                            strokeOpacity={i === 0 ? "1" : "0.1"}
                                                            strokeWidth="15"
                                                            strokeDasharray={dashArray}
                                                            strokeDashoffset={offset}
                                                            className="transition-all duration-1000"
                                                        />
                                                    );
                                                });
                                            })()}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-white">{data.comparison.reduce((acc, c) => acc + c.count, 0)}</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {data.comparison.map((c, i) => (
                                            <div key={c.type} className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[200px]">
                                                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-red-600' : 'bg-white/20'}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.type}</p>
                                                    <p className="text-xl font-black text-white">{c.count} usuários</p>
                                                    <p className="text-[10px] font-mono text-red-500 font-bold">Média: {c.avg} pts</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl bg-[#16161a] border border-white/5 p-6">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Piloto Sensação</p>
                            <h4 className="text-lg font-black text-white uppercase italic">{data.pilotStats[0]?.name || 'N/A'}</h4>
                            <p className="text-xs text-red-500 font-bold mt-2">Escolha nº 1 em {data.pilotStats[0]?.p1 || 0} palpites</p>
                        </div>
                        <div className="rounded-2xl bg-[#16161a] border border-white/5 p-6">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Precisão da Rodada</p>
                            <h4 className="text-lg font-black text-white uppercase italic">Média Global</h4>
                            <p className="text-xs text-red-500 font-bold mt-2">
                                {data.pointsEvolution[data.pointsEvolution.length - 1]?.avgPoints || 0} pontos na última corrida
                            </p>
                        </div>
                        <div className="rounded-2xl bg-[#16161a] border border-white/5 p-6">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total de Participação</p>
                            <h4 className="text-lg font-black text-white uppercase italic">Engajamento</h4>
                            <p className="text-xs text-red-500 font-bold mt-2">
                                {data.pilotStats.reduce((acc, s) => acc + s.total, 0)} pilotos escalados no total
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
