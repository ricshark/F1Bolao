import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_15px_rgba(220,38,38,0.8)] opacity-50" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            F1
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white">BOLÃO</h1>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Prediction League</p>
          </div>
        </div>
        <nav>
          <Link
            href="/login"
            className="rounded-full border border-red-600/30 bg-red-600/10 px-6 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-600 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            Acessar Conta
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4">
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-500 mb-4">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Season 2026 is Live
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 pb-2">
            Acelere Seus <br />
            <span className="text-red-500">Palpites</span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-400 font-light leading-relaxed">
            Bem-vindo ao F1 Bolão! Reúna seus amigos, faça suas previsões para o pódio de cada Grande Prêmio e dispute quem entende mais de Fórmula 1. Uma brincadeira feita <span className="font-semibold text-white">apenas para diversão</span>.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95"
            >
              Começar a Jogar
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
    </div>
  );
}
