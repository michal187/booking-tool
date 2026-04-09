import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EquipmentDetail from '@/components/EquipmentDetail';
import type { EquipmentGroup, Reservation } from '@/types/schema';

describe('EquipmentDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T08:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows active and upcoming reservations for the selected equipment', () => {
    const group: EquipmentGroup = {
      name: 'Vector VN1600',
      total: 2,
      available: 1,
      items: [
        {
          id: 'eq-001',
          name: 'Vector VN1600',
          status: 'available',
          createdAt: '2026-04-09T00:00:00.000Z',
        },
        {
          id: 'eq-002',
          name: 'Vector VN1600',
          status: 'available',
          createdAt: '2026-04-09T00:00:00.000Z',
        },
      ],
    };
    const reservations: Reservation[] = [
      {
        id: 'res-active',
        equipmentId: 'eq-001',
        userId: 'user-001',
        startAt: '2026-04-10T08:00:00.000Z',
        endAt: '2026-04-10T09:00:00.000Z',
        status: 'confirmed',
        isReturned: false,
        createdAt: '2026-04-09T00:00:00.000Z',
      },
      {
        id: 'res-upcoming',
        equipmentId: 'eq-002',
        userId: 'user-002',
        startAt: '2026-04-10T11:00:00.000Z',
        endAt: '2026-04-10T12:00:00.000Z',
        status: 'pending',
        isReturned: false,
        createdAt: '2026-04-09T00:00:00.000Z',
      },
    ];

    render(
      <EquipmentDetail
        group={group}
        reservations={reservations}
        userId="user-001"
        isOverdue={false}
        onReserve={vi.fn()}
      />
    );

    expect(screen.getByText('Dostępny do rezerwacji')).toBeInTheDocument();
    expect(screen.getByText(/Nadchodzące rezerwacje \(1\)/)).toBeInTheDocument();
  });

  it('disables reservations when no units are currently available', () => {
    render(
      <EquipmentDetail
        group={{
          name: 'Adaptery OBD-II',
          total: 1,
          available: 0,
          items: [
            {
              id: 'eq-003',
              name: 'Adaptery OBD-II',
              status: 'blocked',
              createdAt: '2026-04-09T00:00:00.000Z',
            },
          ],
        }}
        reservations={[]}
        userId="user-001"
        isOverdue={false}
        onReserve={vi.fn()}
      />
    );

    expect(screen.getByText('Brak wolnych sztuk')).toBeInTheDocument();
    expect(screen.getByText(/Brak dostępnych sztuk w tym momencie\./)).toBeInTheDocument();
  });
});
