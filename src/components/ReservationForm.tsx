'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { CreateReservationInput } from '@/types/schema';

interface ReservationFormProps {
  equipmentId: string;
  onSubmit: (input: CreateReservationInput) => Promise<{ success: boolean; error?: string }>;
}

export default function ReservationForm({ equipmentId, onSubmit }: ReservationFormProps) {
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = startAt.length > 0 && endAt.length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startAt || !endAt) {
      setError('Uzupełnij obie daty.');
      return;
    }

    // Normalize to full hours (datetime-local gives "YYYY-MM-DDTHH:MM")
    const startISO = new Date(startAt).toISOString();
    const endISO = new Date(endAt).toISOString();

    setLoading(true);
    const result = await onSubmit({
      equipmentId,
      startAt: startISO,
      endAt: endISO,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Wystąpił nieznany błąd.');
    } else {
      setStartAt('');
      setEndAt('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start-date" className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Od
          </label>
          <input
            id="start-date"
            type="datetime-local"
            step="3600"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
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
            step="3600"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

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
        {loading ? 'Rezerwuję...' : '🔒 Zarezerwuj'}
      </button>
    </form>
  );
}
