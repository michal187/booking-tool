import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();

  const equipment = db.equipment.find((e) => e.id === id);
  if (!equipment) {
    return NextResponse.json(
      { error: 'Nie znaleziono sprzętu.' },
      { status: 404 }
    );
  }

  // Toggle available <-> blocked (soft flag, no impact on reservations)
  equipment.status = equipment.status === 'available' ? 'blocked' : 'available';
  writeDb(db);

  return NextResponse.json(equipment);
}
