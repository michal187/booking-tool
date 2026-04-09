'use client';

import { useState } from 'react';
import { Search, Circle } from 'lucide-react';
import type { EquipmentGroup } from '@/types/schema';

interface EquipmentListProps {
  groups: EquipmentGroup[];
  selectedName: string | null;
  onSelect: (name: string) => void;
}

export default function EquipmentList({ groups, selectedName, onSelect }: EquipmentListProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? groups.filter((g) =>
        g.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : groups;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3">Sprzęt</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj sprzętu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            id="equipment-search"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {groups.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Ładowanie sprzętu...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Brak wyników dla &quot;{query}&quot;</p>
        ) : (
          filtered.map((group) => {
            const isSelected = group.name === selectedName;
            const hasAvailable = group.available > 0;

            return (
              <button
                key={group.name}
                onClick={() => onSelect(group.name)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                    : 'hover:bg-slate-700/50 text-slate-300 border border-transparent'
                }`}
              >
                <span className="text-sm font-medium truncate">{group.name}</span>
                <span className="flex items-center gap-1.5 shrink-0 ml-2">
                  <Circle
                    className={`w-2.5 h-2.5 fill-current ${
                      hasAvailable ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  />
                  <span className={`text-xs font-medium ${hasAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                    {group.available}/{group.total}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
