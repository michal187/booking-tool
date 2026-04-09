'use client';

import { useEffect, useState, useCallback } from 'react';
import type { User, Equipment, Reservation, EquipmentGroup, CreateReservationInput } from '@/types/schema';
import { parseISO } from 'date-fns';
import Header from '@/components/Header';
import EquipmentList from '@/components/EquipmentList';
import EquipmentDetail from '@/components/EquipmentDetail';
import ReservationList from '@/components/ReservationList';
import AdminPanel from '@/components/AdminPanel';
import OverdueAlert from '@/components/OverdueAlert';
import Toast, { showToast } from '@/components/Toast';
import { Package, LogIn } from 'lucide-react';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [groups, setGroups] = useState<EquipmentGroup[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [eqRes, groupRes, resRes] = await Promise.all([
      fetch('/api/equipment'),
      fetch('/api/equipment?grouped=true'),
      fetch('/api/reservations'),
    ]);
    const eq = (await eqRes.json()) as Equipment[];
    const grp = (await groupRes.json()) as EquipmentGroup[];
    const res = (await resRes.json()) as Reservation[];
    setEquipment(eq);
    setGroups(grp);
    setReservations(res);
  }, []);

  useEffect(() => {
    async function init() {
      // Seed if empty
      await fetch('/api/seed', { method: 'POST' });

      // Fetch users (for admin panel display)
      const usersRes = await fetch('/api/users');
      const usersData = (await usersRes.json()) as User[];
      setUsers(usersData);

      await fetchData();
      setLoading(false);
    }
    init();
  }, [fetchData]);

  const selectedGroup = groups.find((g) => g.name === selectedName) ?? null;

  const now = new Date();
  const isOverdue = currentUser
    ? reservations.some(
        (r) =>
          r.userId === currentUser.id &&
          r.status === 'confirmed' &&
          !r.isReturned &&
          parseISO(r.endAt) < now
      )
    : false;

  async function handleLogin(login: string, password: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error: string };
      showToast('error', data.error);
      return { success: false, error: data.error };
    }

    const user = (await res.json()) as User;
    setCurrentUser(user);
    setSelectedName(null);
    showToast('success', `Zalogowano jako ${user.name}`);
    await fetchData();
    return { success: true };
  }

  function handleLogout() {
    setCurrentUser(null);
    setSelectedName(null);
    showToast('success', 'Wylogowano pomyślnie');
  }

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

    showToast('success', 'Rezerwacja złożona — oczekuje na akceptację!');
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

  async function handlePatchReservation(id: string, action: 'confirm' | 'reject' | 'return') {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      const labels = { confirm: 'Zaakceptowano', reject: 'Odrzucono', return: 'Zwrot potwierdzony' };
      showToast('success', labels[action]);
      await fetchData();
    } else {
      const data = (await res.json()) as { error: string };
      showToast('error', data.error);
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
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Not logged in — show login prompt */}
      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
              <LogIn className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-medium">Zaloguj się</p>
            <p className="text-sm text-slate-400">Użyj formularza w prawym górnym rogu, aby się zalogować</p>
            <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-left space-y-1.5">
              <p className="text-xs font-medium text-slate-300 mb-2">Dane testowe:</p>
              <p className="text-xs text-slate-400"><span className="text-slate-300 font-mono">jan</span> / <span className="text-slate-300 font-mono">jan123</span> — Jan Kowalski</p>
              <p className="text-xs text-slate-400"><span className="text-slate-300 font-mono">anna</span> / <span className="text-slate-300 font-mono">anna123</span> — Anna Nowak</p>
              <p className="text-xs text-slate-400"><span className="text-slate-300 font-mono">piotr</span> / <span className="text-slate-300 font-mono">piotr123</span> — Piotr Inżynier</p>
              <p className="text-xs text-slate-400"><span className="text-slate-300 font-mono">admin</span> / <span className="text-slate-300 font-mono">admin123</span> — Administrator</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Global overdue alert */}
          {isOverdue && (
            <div className="px-6 pt-4">
              <OverdueAlert
                reservations={reservations}
                equipment={equipment}
                userId={currentUser.id}
              />
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            {/* Left panel — equipment list */}
            <aside className="w-80 bg-slate-900/60 border-r border-slate-700/50 flex flex-col shrink-0">
              <EquipmentList
                groups={groups}
                selectedName={selectedName}
                onSelect={setSelectedName}
              />
            </aside>

            {/* Right panel — details + reservations */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Admin panel always visible at the top for admins */}
              {currentUser.role === 'admin' && (
                <AdminPanel
                  equipment={equipment}
                  reservations={reservations}
                  users={users}
                  onAddEquipment={handleAddEquipment}
                  onApprove={(id) => handlePatchReservation(id, 'confirm')}
                  onReject={(id) => handlePatchReservation(id, 'reject')}
                  onReturn={(id) => handlePatchReservation(id, 'return')}
                />
              )}

              {selectedGroup ? (
                <>
                  <EquipmentDetail
                    group={selectedGroup}
                    reservations={reservations}
                    userId={currentUser.id}
                    isOverdue={isOverdue}
                    onReserve={handleReserve}
                  />

                  <div className="border-t border-slate-700/50 pt-6">
                    <ReservationList
                      reservations={reservations}
                      equipment={equipment}
                      userId={currentUser.id}
                      onReturn={(id) => handlePatchReservation(id, 'return')}
                    />
                  </div>
                </>
              ) : (
                !currentUser.role.includes('admin') && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Package className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Wybierz sprzęt z listy</p>
                    <p className="text-sm mt-1">Kliknij na kategorię po lewej, aby zobaczyć szczegóły</p>
                  </div>
                )
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
