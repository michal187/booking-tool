import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { buildSeedEquipment, buildSeedUsers } from '@/lib/seed-data';

export async function POST() {
  const db = readDb();

  if (db.equipment.length > 0) {
    return NextResponse.json({ seeded: false, message: 'Dane już istnieją.' });
  }

  db.users = buildSeedUsers();
  db.equipment = buildSeedEquipment();
  db.reservations = [];
  writeDb(db);

  return NextResponse.json({
    seeded: true,
    users: db.users.length,
    equipment: db.equipment.length,
  });
}
