'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Plus, ShieldAlert, Check, X, AlertTriangle, Clock, Package } from 'lucide-react';
import type { Equipment, Reservation, User } from '@/types/schema';

interface AdminPanelProps {
  equipment: Equipment[];
  reservations: Reservation[];
  users: User[];
  onAddEquipment: (name: string) => Promise<void>;
  onApprove: (reservationId: string) => Promise<void>;
  onReject: (reservationId: string) => Promise<void>;
  onReturn: (reservationId: string) => Promise<void>;
}

function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: pl });
}

export default function AdminPanel({
  equipment,
  reservations,
  users,
  onAddEquipment,
  onApprove,
  onReject,
  onReturn,
}: AdminPanelProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'active' | 'manage'>('queue');

  const equipmentMap = new Map(equipment.map((e) => [e.id, e.name]));
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const now = new Date();

  // Pending reservations
  const pendingReservations = reservations
    .filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Active loans (confirmed, not returned)
  const activeLoans = reservations
    .filter((r) => r.status === 'confirmed' && !r.isReturned)
    .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());

  // Equipment categories (unique names)
  const categoryNames = [...new Set(equipment.map((e) => e.name))].sort();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAddEquipment(name.trim());
    setName('');
    setLoading(false);
  }

  const tabs = [
    { id: 'queue' as const, label: 'Kolejka', count: pendingReservations.length },
    { id: 'active' as const, label: 'Wypożyczenia', count: activeLoans.length },
    { id: 'manage' as const, label: 'Zarządzanie', count: null },
  ];

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
      <h3 className="text-base font-semibold text-amber-300 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" />
        Panel Admina
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-800/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="bg-amber-500/30 text-amber-200 rounded-full px-1.5 text-[10px] font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Queue tab */}
      {activeTab === 'queue' && (
        <div className="space-y-2">
          {pendingReservations.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Brak oczekujących rezerwacji.</p>
          ) : (
            pendingReservations.map((r) => (
              <div key={r.id} className="bg-slate-800/40 border border-slate-700/40 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-white">
                      {equipmentMap.get(r.equipmentId) ?? r.equipmentId}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({userMap.get(r.userId) ?? r.userId})
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onApprove(r.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Akceptuj
                    </button>
                    <button
                      onClick={() => onReject(r.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      Odrzuć
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {formatDate(r.startAt)} → {formatDate(r.endAt)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Active loans tab */}
      {activeTab === 'active' && (
        <div className="space-y-2">
          {activeLoans.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">Brak aktywnych wypożyczeń.</p>
          ) : (
            activeLoans.map((r) => {
              const isOverdue = parseISO(r.endAt) < now;
              return (
                <div
                  key={r.id}
                  className={`bg-slate-800/40 border rounded-lg px-4 py-3 ${
                    isOverdue ? 'border-red-500/40 bg-red-500/5' : 'border-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {equipmentMap.get(r.equipmentId) ?? r.equipmentId}
                      </span>
                      {isOverdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <button
                      onClick={() => onReturn(r.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all cursor-pointer"
                    >
                      Potwierdź zwrot
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      <span className="text-slate-300">{userMap.get(r.userId) ?? r.userId}</span>
                      {' · '}
                      <Clock className="w-3 h-3 inline" /> {formatDate(r.endAt)}
                    </p>
                    {isOverdue && (
                      <span className="text-xs text-red-400 font-medium">Spóźniony!</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Manage tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {/* Add equipment */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa sprzętu (nowa sztuka)..."
              list="equipment-categories"
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              id="admin-equipment-name"
            />
            <datalist id="equipment-categories">
              {categoryNames.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                name.trim() && !loading
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Dodaj
            </button>
          </form>

          {/* Equipment summary */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 mb-2">Podsumowanie puli sprzętu</p>
            {categoryNames.map((cat) => {
              const count = equipment.filter((e) => e.name === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    {cat}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {count} szt.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
