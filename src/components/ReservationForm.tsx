'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { differenceInMinutes, format, addHours } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { CreateReservationInput } from '@/types/schema';

interface ReservationFormProps {
  equipmentName: string;
  userId: string;
  disabled?: boolean;
  disabledReason?: string;
  onSubmit: (input: CreateReservationInput) => Promise<{ success: boolean; error?: string }>;
}

function formatDurationPolish(minutes: number): string {
  if (minutes < 0) return 'niepoprawny czas';
  if (minutes === 0) return '0 minut';
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dzień' : 'dni'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'godzina' : hours > 1 && hours < 5 ? 'godziny' : 'godzin'}`);
  if (mins > 0) parts.push(`${mins} min`);
  
  return parts.join(' ');
}

export default function ReservationForm({ equipmentName, userId, disabled, disabledReason, onSubmit }: ReservationFormProps) {
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set default times on mount
  useEffect(() => {
    const now = new Date();
    const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");
    const defaultEnd = format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm");
    setStartAt(defaultStart);
    setEndAt(defaultEnd);
  }, [equipmentName]); // refresh defaults on changing equipment

  const durationMinutes = (startAt && endAt) ? differenceInMinutes(new Date(endAt), new Date(startAt)) : 0;
  const canSubmit = startAt.length > 0 && endAt.length > 0 && !loading && !disabled && durationMinutes >= 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startAt || !endAt) {
      setError('Uzupełnij obie daty.');
      return;
    }

    if (durationMinutes < 0) {
      setError('Czas zakończenia nie może być przed czasem rozpoczęcia.');
      return;
    }

    const startISO = new Date(startAt).toISOString();
    const endISO = new Date(endAt).toISOString();

    setLoading(true);
    const result = await onSubmit({
      equipmentName,
      userId,
      startAt: startISO,
      endAt: endISO,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Wystąpił nieznany błąd.');
    } else {
      // Re-initialize to default after success
      const now = new Date();
      setStartAt(format(now, "yyyy-MM-dd'T'HH:mm"));
      setEndAt(format(addHours(now, 1), "yyyy-MM-dd'T'HH:mm"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {disabled && disabledReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-sm">
          ⚠️ {disabledReason}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start-date" className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Od
          </label>
          <input
            id="start-date"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            Do
          </label>
          <input
            id="end-date"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {startAt && endAt && durationMinutes >= 0 && (
        <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/50">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Czas rezerwacji: <span className="font-medium text-slate-300">{formatDurationPolish(durationMinutes)}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          canSubmit
            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/20 cursor-pointer'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
        }`}
      >
        {loading ? 'Wysyłam zgłoszenie...' : '📋 Złóż rezerwację'}
      </button>
    </form>
  );
}
