import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { countAvailableUnits } from '@/lib/validation';
import type { CreateEquipmentInput, Equipment, EquipmentGroup } from '@/types/schema';

export async function GET(request: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(request.url);
  const grouped = searchParams.get('grouped');

  if (grouped === 'true') {
    // Group equipment by name and enrich with availability info
    const nameMap = new Map<string, Equipment[]>();
    for (const eq of db.equipment) {
      const list = nameMap.get(eq.name) ?? [];
      list.push(eq);
      nameMap.set(eq.name, list);
    }

    const groups: EquipmentGroup[] = [];
    for (const [name, items] of nameMap) {
      const { available, total } = countAvailableUnits(name, db.equipment, db.reservations);
      groups.push({ name, total, available, items });
    }

    return NextResponse.json(groups);
  }

  return NextResponse.json(db.equipment);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateEquipmentInput;

  if (!body.name || body.name.trim().length === 0) {
    return NextResponse.json(
      { error: 'Nazwa sprzętu jest wymagana.' },
      { status: 400 }
    );
  }

  const db = readDb();

  const newEquipment: Equipment = {
    id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: body.name.trim(),
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  db.equipment.push(newEquipment);
  writeDb(db);

  return NextResponse.json(newEquipment, { status: 201 });
}
