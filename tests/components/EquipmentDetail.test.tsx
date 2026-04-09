import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EquipmentDetail from '@/components/EquipmentDetail';
import type { Equipment, Reservation } from '@/types/schema';

describe('EquipmentDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T08:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows active and upcoming reservations for the selected equipment', () => {
    const equipment: Equipment = {
      id: 'eq-001',
      name: 'Vector VN1600',
      status: 'available',
      createdAt: '2026-04-09T00:00:00.000Z',
    };
    const reservations: Reservation[] = [
      {
        id: 'res-active',
        equipmentId: 'eq-001',
        startAt: '2026-04-10T08:00:00.000Z',
        endAt: '2026-04-10T09:00:00.000Z',
        createdAt: '2026-04-09T00:00:00.000Z',
      },
      {
        id: 'res-upcoming',
        equipmentId: 'eq-001',
        startAt: '2026-04-10T11:00:00.000Z',
        endAt: '2026-04-10T12:00:00.000Z',
        createdAt: '2026-04-09T00:00:00.000Z',
      },
    ];

    render(
      <EquipmentDetail
        equipment={equipment}
        reservations={reservations}
        onReserve={vi.fn()}
      />
    );

    expect(screen.getByText('Aktualnie wypożyczony')).toBeInTheDocument();
    expect(screen.getByText(/Nadchodzące rezerwacje \(1\)/)).toBeInTheDocument();
  });

  it('explains that blocked equipment can still be reserved', () => {
    render(
      <EquipmentDetail
        equipment={{
          id: 'eq-003',
          name: 'Adaptery OBD-II',
          status: 'blocked',
          createdAt: '2026-04-09T00:00:00.000Z',
        }}
        reservations={[]}
        onReserve={vi.fn()}
      />
    );

    expect(screen.getByText(/nadal można go zarezerwować/i)).toBeInTheDocument();
  });
});
