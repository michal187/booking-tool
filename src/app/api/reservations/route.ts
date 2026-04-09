import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { validateReservation, hasOverdueItems, findAvailableUnit } from '@/lib/validation';
import type { CreateReservationInput, Reservation } from '@/types/schema';

export async function GET(request: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  let results = db.reservations;
  if (userId) {
    results = results.filter((r) => r.userId === userId);
  }

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateReservationInput;

  if (!body.equipmentName || !body.userId || !body.startAt || !body.endAt) {
    return NextResponse.json(
      { error: 'Wymagane pola: equipmentName, userId, startAt, endAt.' },
      { status: 400 }
    );
  }

  const db = readDb();

  // Verify user exists
  const user = (db.users ?? []).find((u) => u.id === body.userId);
  if (!user) {
    return NextResponse.json(
      { error: 'Nie znaleziono użytkownika.' },
      { status: 404 }
    );
  }

  // Check if user has overdue items
  if (hasOverdueItems(body.userId, db.reservations)) {
    return NextResponse.json(
      { error: 'Masz nieoddany sprzęt po terminie. Najpierw zwróć zaległy sprzęt.' },
      { status: 403 }
    );
  }

  // Find available unit for the requested equipment category
  const equipmentId = findAvailableUnit(
    body.equipmentName,
    body.startAt,
    body.endAt,
    db.equipment,
    db.reservations
  );

  if (!equipmentId) {
    return NextResponse.json(
      { error: `Brak dostępnych sztuk "${body.equipmentName}" w wybranym terminie.` },
      { status: 422 }
    );
  }

  // Validate the specific unit reservation
  const validation = validateReservation(
    { equipmentId, startAt: body.startAt, endAt: body.endAt },
    db.reservations
  );
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.reason },
      { status: 422 }
    );
  }

  const newReservation: Reservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    equipmentId,
    userId: body.userId,
    startAt: body.startAt,
    endAt: body.endAt,
    status: 'pending',
    isReturned: false,
    createdAt: new Date().toISOString(),
  };

  db.reservations.push(newReservation);
  writeDb(db);

  return NextResponse.json(newReservation, { status: 201 });
}
