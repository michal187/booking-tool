'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Role, Equipment, Reservation, CreateReservationInput } from '@/types/schema';
import Header from '@/components/Header';
import EquipmentList from '@/components/EquipmentList';
import EquipmentDetail from '@/components/EquipmentDetail';
import ReservationList from '@/components/ReservationList';
import AdminPanel from '@/components/AdminPanel';
import Toast, { showToast } from '@/components/Toast';
import { Package } from 'lucide-react';

export default function HomePage() {
  const [role, setRole] = useState<Role>('user');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [eqRes, resRes] = await Promise.all([
      fetch('/api/equipment'),
      fetch('/api/reservations'),
    ]);
    const eq = (await eqRes.json()) as Equipment[];
    const res = (await resRes.json()) as Reservation[];
    setEquipment(eq);
    setReservations(res);
  }, []);

  useEffect(() => {
    async function init() {
      // Seed if empty
      await fetch('/api/seed', { method: 'POST' });
      await fetchData();
      setLoading(false);
    }
    init();
  }, [fetchData]);

  const selectedEquipment = equipment.find((e) => e.id === selectedId) ?? null;

  async function handleReserve(
    input: CreateReservationInput
  ): Promise<{ success: boolean; error?: string }> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error: string };
      showToast('error', data.error);
      return { success: false, error: data.error };
    }

    showToast('success', 'Rezerwacja utworzona pomyślnie!');
    await fetchData();
    return { success: true };
  }

  async function handleAddEquipment(name: string) {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      showToast('success', `Dodano sprzęt: ${name}`);
      await fetchData();
    } else {
      const data = (await res.json()) as { error: string };
      showToast('error', data.error);
    }
  }

  async function handleToggleBlocked(id: string) {
    const res = await fetch(`/api/equipment/${id}`, { method: 'PATCH' });
    if (res.ok) {
      const updated = (await res.json()) as Equipment;
      showToast(
        'success',
        `${updated.name}: ${updated.status === 'blocked' ? 'zablokowany' : 'odblokowany'}`
      );
      await fetchData();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Toast />
      <Header
        role={role}
        onToggleRole={() => setRole((r) => (r === 'user' ? 'admin' : 'user'))}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — equipment list */}
        <aside className="w-80 bg-slate-900/60 border-r border-slate-700/50 flex flex-col shrink-0">
          <EquipmentList
            equipment={equipment}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        {/* Right panel — details + reservations */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedEquipment ? (
            <>
              <EquipmentDetail
                equipment={selectedEquipment}
                reservations={reservations}
                onReserve={handleReserve}
              />

              <div className="border-t border-slate-700/50 pt-6">
                <ReservationList
                  reservations={reservations}
                  equipment={equipment}
                />
              </div>

              {role === 'admin' && (
                <div className="border-t border-slate-700/50 pt-6">
                  <AdminPanel
                    equipment={equipment}
                    selectedId={selectedId}
                    onAddEquipment={handleAddEquipment}
                    onToggleBlocked={handleToggleBlocked}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Package className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Wybierz sprzęt z listy</p>
              <p className="text-sm mt-1">Kliknij na element po lewej, aby zobaczyć szczegóły</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
