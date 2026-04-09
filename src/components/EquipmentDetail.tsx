'use client';

import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarCheck, Clock, Info, User } from 'lucide-react';
import type { EquipmentGroup, Reservation, CreateReservationInput, User as UserType } from '@/types/schema';
import ReservationForm from './ReservationForm';

interface EquipmentDetailProps {
  group: EquipmentGroup;
  reservations: Reservation[];
  users: UserType[];
  userId: string;
  isOverdue: boolean;
  onReserve: (input: CreateReservationInput) => Promise<{ success: boolean; error?: string }>;
}

function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd.MM.yyyy HH:mm', { locale: pl });
}

export default function EquipmentDetail({ group, reservations, users, userId, isOverdue, onReserve }: EquipmentDetailProps) {
  const now = new Date();

  // Get all reservations for this equipment group
  const equipmentIds = new Set(group.items.map((i) => i.id));
  const groupReservations = reservations
    .filter((r) => equipmentIds.has(r.equipmentId))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const upcomingReservations = groupReservations.filter(
    (r) => parseISO(r.startAt) > now && (r.status === 'pending' || r.status === 'confirmed')
  );

  const hasAvailable = group.available > 0;
  const formDisabled = !hasAvailable || isOverdue;
  const disabledReason = isOverdue
    ? 'Masz nieoddany sprzęt po terminie. Najpierw dokonaj zwrotu.'
    : !hasAvailable
    ? 'Brak dostępnych sztuk w tym momencie.'
    : undefined;

  return (
    <div className="space-y-6">
      {/* Equipment header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">{group.name}</h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              hasAvailable
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-300 border border-red-500/30'
            }`}
          >
            Dostępne: {group.available} z {group.total}
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          {group.total} {group.total === 1 ? 'sztuka' : group.total < 5 ? 'sztuki' : 'sztuk'} w magazynie
        </p>
      </div>

      {/* Current status */}
      {hasAvailable ? (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-start gap-3">
          <CalendarCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-emerald-200 font-medium text-sm">Dostępny do rezerwacji</p>
            <p className="text-emerald-300/70 text-sm mt-1">
              {group.available} {group.available === 1 ? 'sztuka wolna' : group.available < 5 ? 'sztuki wolne' : 'sztuk wolnych'}. System automatycznie przypisze Ci wolną jednostkę.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-200 font-medium text-sm">Brak wolnych sztuk</p>
            <p className="text-red-300/70 text-sm mt-1">
              Wszystkie sztuki są aktualnie zarezerwowane lub wypożyczone.
            </p>
          </div>
        </div>
      )}

      {/* Reservation form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Zarezerwuj
        </h3>
        <ReservationForm
          equipmentName={group.name}
          userId={userId}
          disabled={formDisabled}
          disabledReason={disabledReason}
          onSubmit={onReserve}
        />
      </div>

      {/* Upcoming reservations */}
      {upcomingReservations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Nadchodzące rezerwacje ({upcomingReservations.length})
          </h3>
          <div className="space-y-2">
            {upcomingReservations.map((r) => {
              const u = users.find((user) => user.id === r.userId);
              return (
                <div
                  key={r.id}
                  className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {u ? u.name : 'Nieznany'} {r.userId === userId && <span className="text-[10px] text-blue-400 font-normal border border-blue-400/30 bg-blue-400/10 px-1 rounded">Ty</span>}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === 'pending'
                        ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {r.status === 'pending' ? 'Oczekuje' : 'Potwierdzona'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(r.startAt)}</span>
                    <span className="text-slate-600">→</span>
                    <span>{formatDate(r.endAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
