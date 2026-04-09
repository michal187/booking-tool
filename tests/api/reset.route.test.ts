import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/reset/route';

const { resetDbFromTemplate } = vi.hoisted(() => ({
  resetDbFromTemplate: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  resetDbFromTemplate,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/reset', () => {
  it('restores the active DB from the configured template', async () => {
    resetDbFromTemplate.mockReturnValue({
      equipment: [{ id: 'eq-001', name: 'Vector VN1600', status: 'available', createdAt: '2026-04-09T00:00:00.000Z' }],
      reservations: [],
    });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(resetDbFromTemplate).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({
      reset: true,
      equipmentCount: 1,
      reservationCount: 0,
    });
  });
});
