'use client';

import { Shield, User } from 'lucide-react';
import type { Role } from '@/types/schema';

interface HeaderProps {
  role: Role;
  onToggleRole: () => void;
}

export default function Header({ role, onToggleRole }: HeaderProps) {
  const isAdmin = role === 'admin';

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

      <button
        onClick={onToggleRole}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
          isAdmin
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
        }`}
      >
        {isAdmin ? (
          <>
            <Shield className="w-4 h-4" />
            Admin
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            Użytkownik
          </>
        )}
      </button>
    </header>
  );
}
