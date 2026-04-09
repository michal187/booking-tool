'use client';

import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BookOpen } from 'lucide-react';
import type { Equipment, Reservation } from '@/types/schema';

interface ReservationListProps {
  reservations: Reservation[];
  equipment: Equipment[];
}

function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: pl });
}

export default function ReservationList({ reservations, equipment }: ReservationListProps) {
  const equipmentMap = new Map(equipment.map((e) => [e.id, e.name]));

  const sorted = [...reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        Moje Rezerwacje
        <span className="text-xs text-slate-500 font-normal">({reservations.length})</span>
      </h3>

      {sorted.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">
          Brak rezerwacji. Wybierz sprzęt i zarezerwuj termin.
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {sorted.map((r) => (
            <div
              key={r.id}
              className="bg-slate-800/30 border border-slate-700/40 rounded-lg px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">
                  {equipmentMap.get(r.equipmentId) ?? r.equipmentId}
                </span>
                <span className="text-xs text-slate-500">
                  {format(parseISO(r.createdAt), 'dd.MM.yyyy', { locale: pl })}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {formatDate(r.startAt)} → {formatDate(r.endAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
