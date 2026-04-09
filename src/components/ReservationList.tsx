'use client';

import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BookOpen, AlertTriangle, RotateCcw } from 'lucide-react';
import type { Equipment, Reservation } from '@/types/schema';

interface ReservationListProps {
  reservations: Reservation[];
  equipment: Equipment[];
  userId: string;
  onReturn: (reservationId: string) => Promise<void>;
}

function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: pl });
}

function getStatusBadge(reservation: Reservation) {
  if (reservation.isReturned) {
    return { label: 'Zwrócona', className: 'bg-slate-500/15 text-slate-300 border border-slate-500/30' };
  }
  switch (reservation.status) {
    case 'pending':
      return { label: 'Oczekuje', className: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30' };
    case 'confirmed':
      return { label: 'Zaakceptowana', className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' };
    case 'rejected':
      return { label: 'Odrzucona', className: 'bg-red-500/15 text-red-300 border border-red-500/30' };
  }
}

export default function ReservationList({ reservations, equipment, userId, onReturn }: ReservationListProps) {
  const equipmentMap = new Map(equipment.map((e) => [e.id, e.name]));
  const now = new Date();

  // Filter to user's reservations only
  const userReservations = reservations.filter((r) => r.userId === userId);

  const sorted = [...userReservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        Moje Rezerwacje
        <span className="text-xs text-slate-500 font-normal">({userReservations.length})</span>
      </h3>

      {sorted.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">
          Brak rezerwacji. Wybierz sprzęt i zarezerwuj termin.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {sorted.map((r) => {
            const badge = getStatusBadge(r);
            const isOverdue =
              r.status === 'confirmed' &&
              !r.isReturned &&
              parseISO(r.endAt) < now;
            const canReturn = r.status === 'confirmed' && !r.isReturned;

            return (
              <div
                key={r.id}
                className={`bg-slate-800/30 border rounded-lg px-4 py-3 ${
                  isOverdue
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-slate-700/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {equipmentMap.get(r.equipmentId) ?? r.equipmentId}
                    </span>
                    {isOverdue && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Spóźniony zwrot!
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {formatDate(r.startAt)} → {formatDate(r.endAt)}
                  </p>
                  {canReturn && (
                    <button
                      onClick={() => onReturn(r.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Zwróć sprzęt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
