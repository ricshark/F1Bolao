'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNews(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[100svh] bg-[#0f0f13] text-gray-100 font-sans">
      <Header />
      
      <section className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            Últimas Notícias <span className="text-red-600">F1</span>
          </h1>
          <p className="text-gray-400 mt-2 text-xs md:text-sm uppercase tracking-widest font-bold">
            Mantenha-se atualizado com o paddock
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse border border-white/5" />
                ))}
             </div>
          ) : news.length === 0 ? (
             <p className="text-center text-gray-500 py-20 bg-white/5 rounded-2xl border border-white/5 font-black uppercase italic">Nenhuma notícia encontrada.</p>
          ) : (
            <div className="grid gap-3">
              {news.map((item, i) => (
                <a 
                  key={i} 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[#16161a] border border-white/5 hover:border-red-600/50 transition-all hover:bg-[#1c1c21] shadow-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-red-600 font-mono italic">#{i + 1}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         {item.date ? new Date(item.date).toLocaleDateString('pt-BR') : 'Recente'}
                       </span>
                    </div>
                    <h2 className="text-sm md:text-lg font-black text-white leading-tight uppercase italic group-hover:text-red-500 transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end shrink-0">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-colors group-hover:scale-110">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
             Fonte: Motorsport.com RSS Feed
           </p>
        </div>
      </section>
    </main>
  );
}
