import { useState, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t, toggleLang } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navLinks = [
    { name: t.navDashboard, path: '/dashboard' },
    { name: t.navRanking, path: '/ranking' },
    { name: t.navMyBets, path: '/minhas-apostas' },
    { name: 'Notícias', path: '/news' }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem não pode ter mais que 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setUploading(true);
      try {
        const res = await fetch('/api/profile/photo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: base64 })
        });
        if (res.ok) {
          alert('Foto atualizada com sucesso!');
          window.location.reload();
        } else {
          alert('Falha ao atualizar foto.');
        }
      } catch (err) {
        alert('Erro ao atualizar foto.');
      } finally {
        setUploading(false);
        setShowProfileModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Tem certeza que deseja remover sua foto?')) return;
    setUploading(true);
    try {
      const res = await fetch('/api/profile/photo', { method: 'DELETE' });
      if (res.ok) {
        alert('Foto removida com sucesso!');
        window.location.reload();
      } else {
        alert('Falha ao remover foto.');
      }
    } catch (err) {
      alert('Erro ao remover foto.');
    } finally {
      setUploading(false);
      setShowProfileModal(false);
    }
  };

  return (
    <>
      <header className="border-b border-red-600/40 bg-[#0a0a0a] sticky top-0 z-40 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 md:py-4">
          
          {/* Logo Left - Responsive sizes */}
          <div className="flex items-center gap-3 md:w-1/4">
            <Link href="/dashboard" className="flex items-center transition hover:scale-105 active:scale-95">
              <div className="relative w-16 h-16 md:w-24 md:h-24">
                <Image 
                  src="/logo.png" 
                  alt="F1 Bolão Logo" 
                  fill
                  className="object-contain rounded-full shadow-2xl" 
                  priority 
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links (Hidden on small screens) */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`text-sm font-black uppercase tracking-widest transition-all hover:text-white ${
                  pathname === link.path ? 'text-red-500 border-b-2 border-red-600 pb-1' : 'text-gray-400 hover:tracking-[0.2em]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section / Hamburger Button */}
          <div className="flex items-center justify-end gap-3 md:gap-4 md:w-1/4">
            
            {/* Desktop-only elements */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={toggleLang}
                className="px-2 py-1 text-[10px] font-black uppercase rounded border border-gray-700 hover:border-red-600 transition text-gray-400 hover:text-white"
              >
                {t.langToggle}
              </button>
              
              {session ? (
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setShowProfileModal(true)}
                    className="text-xs font-bold text-gray-400 hover:text-white transition uppercase border-r border-white/10 pr-3"
                  >
                    {session.user?.name?.split(' ')[0]}
                  </button>
                  {(session.user as any)?.isAdmin && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-tighter hover:bg-white/10 transition"
                    >
                      {t.admin}
                    </button>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="rounded-full bg-red-700 px-4 py-1.5 text-xs font-black uppercase tracking-wide shadow-lg hover:bg-red-600 hover:shadow-red-900/40 transition active:scale-95"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="rounded-full bg-red-700 px-6 py-2 text-xs font-black uppercase tracking-wide shadow-lg hover:bg-red-600 transition active:scale-95"
                >
                  {t.signIn}
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <div className={`lg:hidden fixed inset-0 z-50 bg-[#0f0f13] transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`} style={{ top: '80px' }}>
          <div className="flex flex-col h-full p-8 space-y-8">
             <nav className="flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-xl font-black uppercase tracking-tight italic ${
                      pathname === link.path ? 'text-red-500 pl-3 border-l-2 border-red-600' : 'text-gray-200'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
             </nav>

             <div className="h-px bg-white/5" />

             <div className="flex flex-col gap-6">
                 <button 
                  onClick={() => { toggleLang(); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 text-base font-bold text-gray-400"
                >
                  <span className="text-xl">🌐</span> {t.langToggle}
                </button>
                
                {session ? (
                  <>
                    <button 
                      onClick={() => { setShowProfileModal(true); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 text-base font-bold text-gray-400"
                    >
                      <span className="text-xl">👤</span> {t.greeting}, {session.user?.name?.split(' ')[0]}
                    </button>
                    {(session.user as any)?.isAdmin && (
                      <button
                        onClick={() => { router.push('/admin'); setIsMenuOpen(false); }}
                        className="w-full rounded-xl bg-white/5 border border-white/10 py-4 text-sm font-black uppercase"
                      >
                        {t.admin}
                      </button>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full rounded-xl bg-red-700 py-4 text-sm font-black uppercase shadow-lg shadow-red-900/20"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { signIn(); setIsMenuOpen(false); }}
                    className="w-full rounded-xl bg-red-700 py-4 text-sm font-black uppercase shadow-lg shadow-red-900/20"
                  >
                    {t.signIn}
                  </button>
                )}
             </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#16161a] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Meu Perfil</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                {t.close}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#0f0f13] p-4 text-center">
                <p className="text-sm text-gray-400 mb-4">Altere a sua foto de perfil para aparecer no ranking.</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handlePhotoUpload}
                />
                
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {uploading ? 'Salvando...' : 'Fazer Upload'}
                  </button>
                  <button 
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="rounded bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Nome</label>
                <div className="mt-1 rounded border border-white/10 bg-[#0f0f13] px-3 py-2 text-sm text-gray-400">
                  {session.user?.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">E-mail</label>
                <div className="mt-1 rounded border border-white/10 bg-[#0f0f13] px-3 py-2 text-sm text-gray-400">
                  {session.user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
