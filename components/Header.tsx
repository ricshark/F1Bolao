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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { name: t.navDashboard, path: '/dashboard' },
    { name: t.navRanking, path: '/ranking' },
    { name: t.navMyBets, path: '/minhas-apostas' }
  ];

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo Left */}
          <Link href="/dashboard" className="flex items-center gap-3 w-max">
            <Image src="/logo.png" alt="F1 Bolão Logo" width={96} height={96} className="flex-shrink-0 rounded-full shadow-2xl transition hover:scale-105" priority />
          </Link>

          {/* Center Nav Links */}
          <nav className="flex flex-1 justify-center items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`text-sm font-semibold transition hover:text-white ${
                  pathname === link.path ? 'text-white border-b-2 border-red-600 pb-1' : 'text-gray-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Nav */}
          <div className="flex items-center justify-end gap-4 w-1/4">
            <button 
              onClick={toggleLang}
              className="px-2 py-1 text-xs font-bold uppercase rounded border border-gray-600 hover:border-white transition text-gray-300"
            >
              {t.langToggle}
            </button>
            
            {session ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="text-sm font-medium text-gray-300 hidden md:block hover:text-white transition"
                >
                  {t.greeting}, {session.user?.name?.split(' ')[0]}
                </button>
                {(session.user as any)?.isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="rounded bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition"
                  >
                    {t.admin}
                  </button>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded bg-red-700 px-4 py-1.5 text-sm font-bold shadow-md hover:bg-red-600 transition"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="rounded bg-red-700 px-4 py-1.5 text-sm font-bold shadow-md hover:bg-red-600 transition"
              >
                {t.signIn}
              </button>
            )}
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
