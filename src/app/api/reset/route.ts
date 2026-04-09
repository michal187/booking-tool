import { NextResponse } from 'next/server';
import { resetDbFromTemplate } from '@/lib/db';

export async function POST() {
  const db = resetDbFromTemplate();

  return NextResponse.json({
    reset: true,
    equipmentCount: db.equipment.length,
    reservationCount: db.reservations.length,
  });
}
