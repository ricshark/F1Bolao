'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setPreviewUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || 'Se o e-mail existir, um código foi gerado.');
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      setMessage('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-4">Esqueceu a Senha</h1>
        <p className="text-gray-300 text-sm text-center mb-6">
          Informe seu e-mail e enviaremos um código de 6 dígitos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Enviando...' : 'Enviar Código de Recuperação'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-gray-200">{message}</p>
        )}

        {previewUrl && (
          <div className="mt-4 rounded-lg bg-white/10 p-4 text-sm text-gray-200 text-center">
            <p className="font-semibold mb-2 text-yellow-500">Modo de Teste (Local)</p>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-block bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
            >
              Abrir E-mail Simulado
            </a>
            <p className="mt-4 text-xs text-gray-400">
              Após pegar o código no e-mail, acesse a página <strong><a href="/reset-password" className="underline text-red-400">/reset-password</a></strong>.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-red-400 hover:text-red-300 text-sm">
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  );
}
