'use client';

import { format, parseISO, isWithinInterval } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Info, AlertTriangle, CalendarCheck, Clock } from 'lucide-react';
import type { Equipment, Reservation, CreateReservationInput } from '@/types/schema';
import ReservationForm from './ReservationForm';

interface EquipmentDetailProps {
  equipment: Equipment;
  reservations: Reservation[];
  onReserve: (input: CreateReservationInput) => Promise<{ success: boolean; error?: string }>;
}

function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm', { locale: pl });
}

export default function EquipmentDetail({ equipment, reservations, onReserve }: EquipmentDetailProps) {
  const now = new Date();
  const equipmentReservations = reservations
    .filter((r) => r.equipmentId === equipment.id)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const activeReservation = equipmentReservations.find((r) =>
    isWithinInterval(now, { start: parseISO(r.startAt), end: parseISO(r.endAt) })
  );

  const upcomingReservations = equipmentReservations.filter(
    (r) => parseISO(r.startAt) > now
  );

  const isBlocked = equipment.status === 'blocked';

  return (
    <div className="space-y-6">
      {/* Equipment header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">{equipment.name}</h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isBlocked
                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isBlocked ? 'Zablokowany' : 'Dostępny'}
          </span>
        </div>
        <p className="text-slate-400 text-sm">ID: {equipment.id}</p>
      </div>

      {/* Current status */}
      {activeReservation ? (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-amber-200 font-medium text-sm">Aktualnie wypożyczony</p>
            <p className="text-amber-300/70 text-sm mt-1">
              Do: {formatDate(activeReservation.endAt)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-start gap-3">
          <CalendarCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-emerald-200 font-medium text-sm">Dostępny do rezerwacji</p>
            <p className="text-emerald-300/70 text-sm mt-1">
              Możesz zarezerwować ten sprzęt poniżej.
            </p>
          </div>
        </div>
      )}

      {/* Blocked info */}
      {isBlocked && (
        <div className="bg-slate-700/40 border border-slate-600/50 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-slate-400 text-sm">
            Ten sprzęt jest oznaczony jako zablokowany, ale nadal można go zarezerwować.
          </p>
        </div>
      )}

      {/* Reservation form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Zarezerwuj
        </h3>
        <ReservationForm equipmentId={equipment.id} onSubmit={onReserve} />
      </div>

      {/* Upcoming reservations */}
      {upcomingReservations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Nadchodzące rezerwacje ({upcomingReservations.length})
          </h3>
          <div className="space-y-2">
            {upcomingReservations.map((r) => (
              <div
                key={r.id}
                className="bg-slate-800/30 border border-slate-700/40 rounded-lg px-4 py-2.5 flex items-center justify-between"
              >
                <span className="text-sm text-slate-300">
                  {formatDate(r.startAt)}
                </span>
                <span className="text-slate-500 text-xs">→</span>
                <span className="text-sm text-slate-300">
                  {formatDate(r.endAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
