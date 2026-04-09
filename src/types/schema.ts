// Domain types for equipment booking MVP

export type Role = 'user' | 'admin';

export type EquipmentStatus = 'available' | 'blocked';

export interface Equipment {
  id: string;
  name: string;
  status: EquipmentStatus;
  createdAt: string; // ISO 8601
}

export interface Reservation {
  id: string;
  equipmentId: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
  createdAt: string; // ISO 8601
}

export interface CreateReservationInput {
  equipmentId: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
}

export interface CreateEquipmentInput {
  name: string;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export interface DbSchema {
  equipment: Equipment[];
  reservations: Reservation[];
}
