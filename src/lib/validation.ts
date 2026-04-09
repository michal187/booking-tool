import { differenceInMinutes, differenceInDays, parseISO } from 'date-fns';
import type { CreateReservationInput, Reservation, ValidationResult } from '@/types/schema';

/**
 * Check if a reservation overlaps with the given time window.
 * Only considers reservations that are pending/confirmed AND not yet returned.
 */
function isBlockingReservation(r: Reservation): boolean {
  return (r.status === 'pending' || r.status === 'confirmed') && !r.isReturned;
}

export function validateReservation(
  input: { equipmentId: string; startAt: string; endAt: string },
  existingReservations: Reservation[]
): ValidationResult {
  const start = parseISO(input.startAt);
  const end = parseISO(input.endAt);

  // Order check — closed interval [start, end]
  if (start >= end) {
    return { ok: false, reason: 'Data rozpoczęcia musi być przed datą zakończenia.' };
  }

  // Duration check — min 15 min
  const minutes = differenceInMinutes(end, start);
  if (minutes < 15) {
    return { ok: false, reason: 'Minimalny czas rezerwacji to 15 minut.' };
  }

  // Duration check — max 7 days
  const days = differenceInDays(end, start);
  if (days > 7) {
    return { ok: false, reason: 'Maksymalny czas rezerwacji to 7 dni.' };
  }

  // Overlap check — same equipmentId only, only blocking reservations
  const equipmentReservations = existingReservations.filter(
    (r) => r.equipmentId === input.equipmentId && isBlockingReservation(r)
  );

  for (const existing of equipmentReservations) {
    const exStart = parseISO(existing.startAt);
    const exEnd = parseISO(existing.endAt);

    // Closed interval overlap: aStart < bEnd && bStart < aEnd
    if (start < exEnd && exStart < end) {
      return {
        ok: false,
        reason: `Konflikt z istniejącą rezerwacją (${existing.startAt} – ${existing.endAt}).`,
      };
    }
  }

  return { ok: true };
}

/**
 * Returns true if the user has overdue (unreturned) equipment past the end date.
 * Such a user should be blocked from making new reservations.
 */
export function hasOverdueItems(userId: string, reservations: Reservation[]): boolean {
  const now = new Date();
  return reservations.some(
    (r) =>
      r.userId === userId &&
      r.status === 'confirmed' &&
      !r.isReturned &&
      parseISO(r.endAt) < now
  );
}

/**
 * Find the first available equipment ID for a given equipment name within a time window.
 * Returns the equipmentId or null if none are available.
 */
export function findAvailableUnit(
  equipmentName: string,
  startAt: string,
  endAt: string,
  allEquipment: { id: string; name: string }[],
  reservations: Reservation[]
): string | null {
  const candidates = allEquipment.filter((e) => e.name === equipmentName);

  for (const candidate of candidates) {
    const result = validateReservation(
      { equipmentId: candidate.id, startAt, endAt },
      reservations
    );
    if (result.ok) {
      return candidate.id;
    }
  }

  return null;
}

/**
 * Count available units for a given equipment name within a time window.
 * If no time window specified, counts units not currently occupied.
 */
export function countAvailableUnits(
  equipmentName: string,
  allEquipment: { id: string; name: string }[],
  reservations: Reservation[]
): { available: number; total: number } {
  const candidates = allEquipment.filter((e) => e.name === equipmentName);
  const total = candidates.length;

  const now = new Date();
  let occupied = 0;

  for (const candidate of candidates) {
    const isOccupied = reservations.some(
      (r) =>
        r.equipmentId === candidate.id &&
        isBlockingReservation(r) &&
        parseISO(r.startAt) <= now &&
        parseISO(r.endAt) >= now
    );
    // Also count as occupied if there's an unreturned reservation even past end date
    const isUnreturned = reservations.some(
      (r) =>
        r.equipmentId === candidate.id &&
        r.status === 'confirmed' &&
        !r.isReturned
    );
    if (isOccupied || isUnreturned) {
      occupied++;
    }
  }

  return { available: total - occupied, total };
}
