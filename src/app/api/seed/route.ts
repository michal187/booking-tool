import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { buildSeedEquipment } from '@/lib/seed-data';

export async function POST() {
  const db = readDb();

  if (db.equipment.length > 0) {
    return NextResponse.json({ seeded: false, message: 'Dane już istnieją.' });
  }

  db.equipment = buildSeedEquipment();
  writeDb(db);

  return NextResponse.json({ seeded: true, count: db.equipment.length });
}
