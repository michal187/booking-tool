'use client';

import { Shield, User, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import type { User as UserType } from '@/types/schema';

interface HeaderProps {
  currentUser: UserType | null;
  onLogin: (login: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
}

export default function Header({ currentUser, onLogin, onLogout }: HeaderProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = currentUser !== null;
  const isAdmin = currentUser?.role === 'admin';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!login.trim() || !password.trim()) {
      setError('Uzupełnij login i hasło.');
      return;
    }
    setLoading(true);
    const result = await onLogin(login.trim(), password.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Błąd logowania.');
    } else {
      setLogin('');
      setPassword('');
      setError(null);
    }
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
          <span className="text-xl font-bold">🔧</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Rezerwacja Sprzętu</h1>
          <p className="text-xs text-slate-400">System zarządzania wypożyczeniami</p>
        </div>
      </div>

      {isLoggedIn ? (
        /* Logged in — name on left, logout button on right */
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Shield className="w-4 h-4 text-amber-400" />
            ) : (
              <User className="w-4 h-4 text-blue-400" />
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400">
                {isAdmin ? 'Administrator' : 'Użytkownik'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer"
            id="logout-button"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj
          </button>
        </div>
      ) : (
        /* Not logged in — login form */
        <form onSubmit={handleLogin} className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-400 mr-2">{error}</span>
          )}
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-28 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            id="login-input"
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-28 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            id="password-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
            id="login-button"
          >
            <LogIn className="w-4 h-4" />
            {loading ? '...' : 'Zaloguj'}
          </button>
        </form>
      )}
    </header>
  );
}
