// Domain types for equipment booking system

export type Role = 'user' | 'admin';

export type EquipmentStatus = 'available' | 'blocked';

export type ReservationStatus = 'pending' | 'confirmed' | 'rejected';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Equipment {
  id: string;
  name: string;
  status: EquipmentStatus;
  createdAt: string; // ISO 8601
}

export interface Reservation {
  id: string;
  equipmentId: string;
  userId: string;
  startAt: string;   // ISO 8601
  endAt: string;     // ISO 8601
  status: ReservationStatus;
  isReturned: boolean;
  createdAt: string;  // ISO 8601
}

export interface CreateReservationInput {
  equipmentName: string;  // category name — API auto-assigns a free unit
  userId: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
}

export interface CreateEquipmentInput {
  name: string;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Grouped equipment view for the UI */
export interface EquipmentGroup {
  name: string;
  total: number;
  available: number;
  items: Equipment[];
}

export interface DbSchema {
  users: User[];
  equipment: Equipment[];
  reservations: Reservation[];
}
