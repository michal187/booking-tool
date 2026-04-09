import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    action: 'confirm' | 'reject' | 'return';
  };

  if (!body.action || !['confirm', 'reject', 'return'].includes(body.action)) {
    return NextResponse.json(
      { error: 'Wymagane pole: action (confirm | reject | return).' },
      { status: 400 }
    );
  }

  const db = readDb();
  const reservation = db.reservations.find((r) => r.id === id);

  if (!reservation) {
    return NextResponse.json(
      { error: 'Nie znaleziono rezerwacji.' },
      { status: 404 }
    );
  }

  switch (body.action) {
    case 'confirm':
      if (reservation.status !== 'pending') {
        return NextResponse.json(
          { error: 'Tylko rezerwacje oczekujące mogą być zatwierdzane.' },
          { status: 422 }
        );
      }
      reservation.status = 'confirmed';
      break;

    case 'reject':
      if (reservation.status !== 'pending') {
        return NextResponse.json(
          { error: 'Tylko rezerwacje oczekujące mogą być odrzucane.' },
          { status: 422 }
        );
      }
      reservation.status = 'rejected';
      break;

    case 'return':
      if (reservation.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Można zwrócić tylko zaakceptowany sprzęt.' },
          { status: 422 }
        );
      }
      if (reservation.isReturned) {
        return NextResponse.json(
          { error: 'Sprzęt został już zwrócony.' },
          { status: 422 }
        );
      }
      reservation.isReturned = true;
      break;
  }

  writeDb(db);
  return NextResponse.json(reservation);
}
