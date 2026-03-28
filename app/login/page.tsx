'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email.split('@')[0], email, password }),
      });
      if (res.ok) {
        alert('Registered successfully! Please login.');
        setIsRegister(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Registration failed: ${data.error || 'Check your data and try again.'}`);
      }
    } else {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/dashboard');
      } else {
        alert(`Login failed: ${result?.error || 'Please check your credentials'}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* F1 Racing Lines */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* F1 Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 mb-4 shadow-2xl">
              <span className="text-3xl font-bold text-white">F1</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">F1 BOLÃO</h1>
            <p className="text-gray-300 text-lg">{t.subtitle}</p>
          </div>

          {/* Login Form */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isRegister ? t.signUp : t.loginTitle}
              </h2>
              <p className="text-gray-400">
                {isRegister ? t.loginMsg : t.loginMsg}
              </p>

              {!isRegister && (
                <div className="mt-2 text-center">
                  <a href="/forgot-password" className="text-red-400 hover:text-red-300 text-sm">
                    Forgot password?
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t.loading}
                  </div>
                ) : (
                  isRegister ? t.signUp : t.signIn
                )}
              </button>
            </form>

            {/* Toggle Register/Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-red-400 hover:text-red-300 transition font-medium"
                disabled={loading}
              >
                {isRegister
                  ? t.alreadyHaveAccount
                  : t.dontHaveAccount
                }
              </button>
            </div>

            {/* F1 Racing Flag */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-8 h-12 bg-black border border-white/20 rounded-sm"></div>
                <div className="w-8 h-12 bg-white border border-white/20 rounded-sm"></div>
                <div className="w-8 h-12 bg-black border border-white/20 rounded-sm"></div>
                <div className="w-8 h-12 bg-white border border-white/20 rounded-sm"></div>
                <div className="w-8 h-12 bg-black border border-white/20 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2026 F1 Bolão - Predict the podium</p>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
    </div>
  );
}
