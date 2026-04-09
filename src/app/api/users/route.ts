import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { User } from '@/types/schema';

export async function GET() {
  const db = readDb();
  // Strip passwords before sending to client
  const users: User[] = (db.users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    login: u.login,
    role: u.role,
  }));
  return NextResponse.json(users);
}
