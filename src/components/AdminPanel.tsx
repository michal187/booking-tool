'use client';

import { useState } from 'react';
import { Plus, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Equipment } from '@/types/schema';

interface AdminPanelProps {
  equipment: Equipment[];
  selectedId: string | null;
  onAddEquipment: (name: string) => Promise<void>;
  onToggleBlocked: (id: string) => Promise<void>;
}

export default function AdminPanel({
  equipment,
  selectedId,
  onAddEquipment,
  onToggleBlocked,
}: AdminPanelProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedEquipment = equipment.find((e) => e.id === selectedId);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAddEquipment(name.trim());
    setName('');
    setLoading(false);
  }

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
      <h3 className="text-base font-semibold text-amber-300 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" />
        Panel Admina
      </h3>

      {/* Add equipment */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nazwa nowego sprzętu..."
          className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          id="admin-equipment-name"
        />
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

      {/* Toggle blocked */}
      {selectedEquipment && (
        <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
          <div>
            <p className="text-sm text-white font-medium">{selectedEquipment.name}</p>
            <p className="text-xs text-slate-400">
              Status: {selectedEquipment.status === 'blocked' ? 'Zablokowany' : 'Dostępny'}
            </p>
          </div>
          <button
            onClick={() => onToggleBlocked(selectedEquipment.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer hover:bg-slate-700/50"
          >
            {selectedEquipment.status === 'blocked' ? (
              <>
                <ToggleRight className="w-5 h-5 text-red-400" />
                <span className="text-red-300">Odblokuj</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300">Zablokuj</span>
              </>
            )}
          </button>
        </div>
      )}

      {!selectedEquipment && (
        <p className="text-xs text-slate-500">Wybierz sprzęt z listy, aby zmienić jego status.</p>
      )}
    </div>
  );
}
