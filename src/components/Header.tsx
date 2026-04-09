'use client';

import { Shield, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { User as UserType } from '@/types/schema';

interface HeaderProps {
  users: UserType[];
  currentUser: UserType | null;
  onSelectUser: (user: UserType) => void;
}

export default function Header({ users, currentUser, onSelectUser }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

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

      {/* User selector dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
            isAdmin
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
          }`}
          id="user-selector"
        >
          {isAdmin ? (
            <Shield className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
          {currentUser?.name ?? 'Wybierz użytkownika'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-in">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="text-xs text-slate-400 font-medium">Zaloguj się jako</p>
            </div>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                  currentUser?.id === user.id ? 'bg-slate-700/30' : ''
                }`}
              >
                {user.role === 'admin' ? (
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm text-white font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400">
                    {user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                  </p>
                </div>
                {currentUser?.id === user.id && (
                  <span className="ml-auto text-xs text-emerald-400">●</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
