'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const texts = {
  en: {
    live: "Season 2026 is Live",
    title1: "Accelerate Your",
    title2: "Predictions",
    descPre: "Welcome to F1 Bolão! Gather your friends, predict the podium for each Grand Prix, and prove who knows more about Formula 1. A game made ",
    fun: "just for fun",
    descPost: ".",
    button: "Start Playing",
    login: "Sign In",
    langToggle: "🇧🇷 PT-BR"
  },
  pt: {
    live: "Temporada 2026 no Ar",
    title1: "Acelere Seus",
    title2: "Palpites",
    descPre: "Bem-vindo ao F1 Bolão! Reúna seus amigos, faça suas previsões para o pódio de cada Grande Prêmio e dispute quem entende mais de Fórmula 1. Uma brincadeira feita ",
    fun: "apenas para diversão",
    descPost: ".",
    button: "Começar a Jogar",
    login: "Acessar Conta",
    langToggle: "🇺🇸 EN"
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'pt'>('en');
  const t = texts[lang];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=3474&auto=format&fit=crop" 
          alt="F1 Racing Car Background"
          fill
          className="object-cover opacity-30 mix-blend-luminosity scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_20px_rgba(220,38,38,1)] opacity-40 animate-[pulse_3s_ease-in-out_infinite]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white shadow-[0_0_20px_rgba(220,38,38,0.7)]">
            F1
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white">BOLÃO</h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Prediction League</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
            className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
          >
            {t.langToggle}
          </button>
          <Link
            href="/login"
            className="hidden sm:inline-block rounded-full border border-red-600/50 bg-red-600/20 px-6 py-2.5 text-sm font-semibold text-red-100 transition-all hover:bg-red-600 hover:text-white hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
          >
            {t.login}
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4">
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-400 mb-4 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]" />
            {t.live}
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight text-white mb-2 drop-shadow-2xl">
            {t.title1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 filter drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              {t.title2}
            </span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-300 font-light leading-relaxed mt-6 drop-shadow-md">
            {t.descPre}
            <span className="font-semibold text-white border-b border-red-500 pb-0.5">{t.fun}</span>
            {t.descPost}
          </p>
          
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-red-700 to-red-600 px-10 py-5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] active:scale-95"
            >
              <span className="relative z-10">{t.button}</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-red-900/20 via-black/50 to-transparent pointer-events-none" />
    </div>
  );
}
