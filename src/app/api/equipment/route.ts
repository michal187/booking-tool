import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { CreateEquipmentInput, Equipment } from '@/types/schema';

export async function GET() {
  const db = readDb();
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
