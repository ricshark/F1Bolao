'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  points: number;
  createdAt: string;
}

interface Bet {
  _id: string;
  user: User;
  race: {
    round: number;
    name: string;
    date: string;
    circuit: string;
  };
  prediction: {
    first: string;
    second: string;
    third: string;
  };
  points: number;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'bets' | 'createUser' | 'settings'>('users');
  const [loading, setLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState({ betLockHours: 1 });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
  });
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    isAdmin: false,
    points: 0,
  });
  const [editUserError, setEditUserError] = useState('');
  //const [editUserError, setEditUserError] = useState('');
  const [editUserSuccess, setEditUserSuccess] = useState('');

  const [betFilter, setBetFilter] = useState('');
  const [betSortConfig, setBetSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const sortedAndFilteredBets = useMemo(() => {
    let result = [...bets];
    if (betFilter) {
      const q = betFilter.toLowerCase();
      result = result.filter(b => b.user.name.toLowerCase().includes(q) || b.race.name.toLowerCase().includes(q));
    }
    if (betSortConfig) {
      result.sort((a, b) => {
        let valA: any, valB: any;
        if (betSortConfig.key === 'user') { valA = a.user.name.toLowerCase(); valB = b.user.name.toLowerCase(); }
        else if (betSortConfig.key === 'race') { valA = a.race.name.toLowerCase(); valB = b.race.name.toLowerCase(); }
        else if (betSortConfig.key === 'points') { valA = a.points; valB = b.points; }
        else if (betSortConfig.key === 'date') { valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); }

        if (valA < valB) return betSortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return betSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [bets, betFilter, betSortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (betSortConfig && betSortConfig.key === key && betSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setBetSortConfig({ key, direction });
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !(session.user as any)?.isAdmin) {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, betsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/bets', { cache: 'no-store' }),
        fetch('/api/admin/settings', { cache: 'no-store' })
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettingsForm({ betLockHours: settingsData.betLockHours || 1 });
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (betsRes.ok) {
        const betsData = await betsRes.json();
        setBets(betsData);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user and all their bets?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('User deleted successfully');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleClearBets = async (userId: string) => {
    if (!confirm('Are you sure you want to delete all bets for this user?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/bets`, { method: 'DELETE' });
      if (res.ok) {
        alert('Bets cleared successfully');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to clear bets');
      }
    } catch (err) {
      alert('Error clearing bets');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePoints = async () => {
    if (!confirm('Deseja recalcular os pontos de todas as apostas baseados nos resultados oficiais da F1 API?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/calculate-points', { method: 'POST' });
      if (res.ok) {
        alert('Pontos calculados e atualizados com sucesso!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Falha ao calcular os pontos');
      }
    } catch (err) {
      alert('Erro inesperado de rede ao calcular os pontos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        setSettingsSuccess('Settings saved successfully!');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserSuccess('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserForm),
      });

      if (response.ok) {
        setCreateUserSuccess('User created successfully!');
        setCreateUserForm({ name: '', email: '', password: '', isAdmin: false });
        fetchData(); // Refresh the users list
      } else {
        const errorData = await response.json();
        setCreateUserError(errorData.error || 'Failed to create user');
      }
    } catch (error) {
      setCreateUserError('An error occurred while creating the user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditUserError('');
    setEditUserSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUserForm),
      });

      if (response.ok) {
        setEditUserSuccess('User updated successfully!');
        fetchData(); // Refresh the users list
        setTimeout(() => {
          setEditingUser(null);
          setEditUserSuccess('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setEditUserError(errorData.error || 'Failed to update user');
      }
    } catch (error) {
      setEditUserError('An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      points: user.points,
    });
    setEditUserError('');
    setEditUserSuccess('');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!session || !(session.user as any)?.isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      <header className="border-b border-red-600/40 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-lg font-bold">F1</div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">{t.adminTitle}</h1>
              <p className="text-xs text-gray-300">{t.adminDesc}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            {t.backToApp}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'users'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              {t.usersTab} ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('createUser')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'createUser'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              {t.createUserTab}
            </button>
            <button
              onClick={() => setActiveTab('bets')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'bets'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              {t.betsTab} ({bets.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              {t.settingsTab}
            </button>
          </div>

          <button
            onClick={handleCalculatePoints}
            disabled={loading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 ml-auto"
          >
            ♺ {t.calcPoints}
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold">{t.usersTab}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Points</th>
                    <th className="text-left py-3 px-4 font-semibold">Admin</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.points}</td>
                      <td className="py-3 px-4">
                        {user.isAdmin ? (
                          <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold">Admin</span>
                        ) : (
                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(user)}
                          className="rounded bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-500 hover:bg-blue-600/40 transition"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleClearBets(user._id)}
                          className="rounded bg-yellow-600/20 px-3 py-1 text-xs font-semibold text-yellow-500 hover:bg-yellow-600/40 transition"
                        >
                          Clear Bets
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="rounded bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-600/40 transition"
                        >
                          Delete User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'createUser' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold">{t.createUserTab}</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  id="name"
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  id="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  id="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={createUserForm.isAdmin}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, isAdmin: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-300">
                  Administrator
                </label>
              </div>
              {createUserError && (
                <p className="text-red-400 text-sm">{createUserError}</p>
              )}
              {createUserSuccess && (
                <p className="text-green-400 text-sm">{createUserSuccess}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                {t.createUserTab}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bets' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">{t.betsTab}</h2>
              <input
                type="text"
                placeholder="Search by User or Race..."
                value={betFilter}
                onChange={(e) => setBetFilter(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => handleSort('user')}>
                      User {betSortConfig?.key === 'user' ? (betSortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => handleSort('race')}>
                      Race {betSortConfig?.key === 'race' ? (betSortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Prediction</th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => handleSort('points')}>
                      Points {betSortConfig?.key === 'points' ? (betSortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => handleSort('date')}>
                      Date {betSortConfig?.key === 'date' ? (betSortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredBets.map(bet => (
                    <tr key={bet._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{bet.user.name}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold">{bet.race.name}</div>
                          <div className="text-xs text-gray-400">{bet.race.circuit}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <div>1st: {bet.prediction.first}</div>
                          <div>2nd: {bet.prediction.second}</div>
                          <div>3rd: {bet.prediction.third}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{bet.points}</td>
                      <td className="py-3 px-4">{new Date(bet.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold">{t.settingsTab}</h2>
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bet Lock Hours Before Race
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={settingsForm.betLockHours}
                    onChange={(e) => setSettingsForm({ betLockHours: Number(e.target.value) })}
                    className="block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {settingsLoading ? t.loading : 'Save Settings'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Number of hours before the race starts when betting and changing bets is locked.
                  (e.g., 1 = 1 hour before race).
                </p>
                {settingsSuccess && (
                  <p className="mt-3 text-sm text-green-400">{settingsSuccess}</p>
                )}
              </div>
            </form>
          </div>
        )}
      </section>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                {t.close}
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">{t.nameLabel}</label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">{t.emailLabel}</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Points</label>
                <input
                  type="number"
                  value={editUserForm.points}
                  onChange={(e) => setEditUserForm({ ...editUserForm, points: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="editIsAdmin"
                  checked={editUserForm.isAdmin}
                  onChange={(e) => setEditUserForm({ ...editUserForm, isAdmin: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                />
                <label htmlFor="editIsAdmin" className="ml-2 block text-sm text-gray-300">
                  Administrator
                </label>
              </div>

              {editUserError && (
                <p className="text-red-400 text-sm mt-2">{editUserError}</p>
              )}
              {editUserSuccess && (
                <p className="text-green-400 text-sm mt-2">{editUserSuccess}</p>
              )}

              <button
                type="submit"
                className="w-full mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}