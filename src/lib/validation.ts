import { differenceInHours, differenceInDays, parseISO } from 'date-fns';
import type { CreateReservationInput, Reservation, ValidationResult } from '@/types/schema';

function isFullHour(dateStr: string): boolean {
  const d = parseISO(dateStr);
  return d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0;
}

export function validateReservation(
  input: CreateReservationInput,
  existingReservations: Reservation[]
): ValidationResult {
  const start = parseISO(input.startAt);
  const end = parseISO(input.endAt);

  // Grid check — full hours only
  if (!isFullHour(input.startAt) || !isFullHour(input.endAt)) {
    return { ok: false, reason: 'Godziny muszą być pełne (np. 08:00, 14:00).' };
  }

  // Order check — closed interval [start, end]
  if (start >= end) {
    return { ok: false, reason: 'Data rozpoczęcia musi być przed datą zakończenia.' };
  }

  // Duration check — min 1h
  const hours = differenceInHours(end, start);
  if (hours < 1) {
    return { ok: false, reason: 'Minimalny czas rezerwacji to 1 godzina.' };
  }

  // Duration check — max 7 days
  const days = differenceInDays(end, start);
  if (days > 7) {
    return { ok: false, reason: 'Maksymalny czas rezerwacji to 7 dni.' };
  }

  // Overlap check — same equipmentId only, closed intervals
  const equipmentReservations = existingReservations.filter(
    (r) => r.equipmentId === input.equipmentId
  );

  for (const existing of equipmentReservations) {
    const exStart = parseISO(existing.startAt);
    const exEnd = parseISO(existing.endAt);

    // Closed interval overlap: aStart <= bEnd && bStart <= aEnd
    if (start <= exEnd && exStart <= end) {
      return {
        ok: false,
        reason: `Konflikt z istniejącą rezerwacją (${existing.startAt} – ${existing.endAt}).`,
      };
    }
  }

  return { ok: true };
}

export function isSlotAvailable(
  equipmentId: string,
  startAt: string,
  endAt: string,
  reservations: Reservation[]
): boolean {
  const result = validateReservation({ equipmentId, startAt, endAt }, reservations);
  return result.ok;
}
