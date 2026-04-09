'use client';

import { AlertTriangle } from 'lucide-react';
import type { Reservation, Equipment } from '@/types/schema';
import { parseISO, format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface OverdueAlertProps {
  reservations: Reservation[];
  equipment: Equipment[];
  userId: string;
}

export default function OverdueAlert({ reservations, equipment, userId }: OverdueAlertProps) {
  const now = new Date();
  const equipmentMap = new Map(equipment.map((e) => [e.id, e.name]));

  const overdueItems = reservations.filter(
    (r) =>
      r.userId === userId &&
      r.status === 'confirmed' &&
      !r.isReturned &&
      parseISO(r.endAt) < now
  );

  if (overdueItems.length === 0) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-slide-in">
      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-red-200 font-semibold text-sm">
          ⚠️ Masz nieoddany sprzęt po terminie!
        </p>
        <p className="text-red-300/70 text-sm mt-1">
          Rezerwacja nowych zasobów jest zablokowana do momentu zwrotu. Dokonaj zwrotu w sekcji &quot;Moje Rezerwacje&quot;.
        </p>
        <div className="mt-2 space-y-1">
          {overdueItems.map((r) => (
            <p key={r.id} className="text-xs text-red-300/60">
              • {equipmentMap.get(r.equipmentId) ?? r.equipmentId} — termin upłynął{' '}
              {format(parseISO(r.endAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
