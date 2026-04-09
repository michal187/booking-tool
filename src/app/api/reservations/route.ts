import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { validateReservation } from '@/lib/validation';
import type { CreateReservationInput, Reservation } from '@/types/schema';

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.reservations);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateReservationInput;

  if (!body.equipmentId || !body.startAt || !body.endAt) {
    return NextResponse.json(
      { error: 'Wymagane pola: equipmentId, startAt, endAt.' },
      { status: 400 }
    );
  }

  const db = readDb();

  // Verify equipment exists
  const equipment = db.equipment.find((e) => e.id === body.equipmentId);
  if (!equipment) {
    return NextResponse.json(
      { error: 'Nie znaleziono sprzętu.' },
      { status: 404 }
    );
  }

  // Validate reservation (blocked status does NOT reject)
  const validation = validateReservation(body, db.reservations);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.reason },
      { status: 422 }
    );
  }

  const newReservation: Reservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    equipmentId: body.equipmentId,
    startAt: body.startAt,
    endAt: body.endAt,
    createdAt: new Date().toISOString(),
  };

  db.reservations.push(newReservation);
  writeDb(db);

  return NextResponse.json(newReservation, { status: 201 });
}
