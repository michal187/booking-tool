import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { LoginInput, User } from '@/types/schema';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginInput;

  if (!body.login || !body.password) {
    return NextResponse.json(
      { error: 'Login i hasło są wymagane.' },
      { status: 400 }
    );
  }

  const db = readDb();
  const dbUser = (db.users ?? []).find(
    (u) => u.login === body.login && u.password === body.password
  );

  if (!dbUser) {
    return NextResponse.json(
      { error: 'Nieprawidłowy login lub hasło.' },
      { status: 401 }
    );
  }

  // Return user without password
  const user: User = {
    id: dbUser.id,
    name: dbUser.name,
    login: dbUser.login,
    role: dbUser.role,
  };

  return NextResponse.json(user);
}
