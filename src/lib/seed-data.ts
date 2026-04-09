import type { Equipment, DbUser } from '@/types/schema';

const SEED_CATEGORIES: { name: string; count: number }[] = [
  { name: 'Vector VN1600', count: 3 },
  { name: 'Kable DB9', count: 5 },
  { name: 'Adaptery OBD-II', count: 4 },
  { name: 'Terminatory CAN', count: 3 },
  { name: 'Rozgałęziatory Y', count: 2 },
  { name: 'Laptopy inżynierskie', count: 4 },
  { name: 'Tablety Rugged', count: 3 },
  { name: 'Data loggery', count: 2 },
  { name: 'Oscyloskopy cyfrowe', count: 2 },
  { name: 'Multimetry', count: 5 },
  { name: 'Kamery termowizyjne', count: 2 },
  { name: 'Zasilacze laboratoryjne', count: 3 },
  { name: 'Breakout boxy', count: 3 },
  { name: 'Termopary', count: 4 },
  { name: 'Akcelerometry', count: 2 },
  { name: 'Moduły pomiarowe ETAS', count: 2 },
  { name: 'Skanery 3D', count: 1 },
  { name: 'Ramiona pomiarowe CMM', count: 1 },
  { name: 'Klucze dynamometryczne', count: 3 },
  { name: 'Endoskopy techniczne', count: 2 },
];

export function buildSeedUsers(): DbUser[] {
  return [
    { id: 'user-001', name: 'Jan Kowalski', login: 'jan', password: 'jan123', role: 'user' },
    { id: 'user-002', name: 'Anna Nowak', login: 'anna', password: 'anna123', role: 'user' },
    { id: 'user-003', name: 'Piotr Inżynier', login: 'piotr', password: 'piotr123', role: 'user' },
    { id: 'user-admin', name: 'Administrator Magazynu', login: 'admin', password: 'admin123', role: 'admin' },
  ];
}

export function buildSeedEquipment(): Equipment[] {
  const now = new Date().toISOString();
  const items: Equipment[] = [];
  let globalIndex = 1;

  for (const category of SEED_CATEGORIES) {
    for (let i = 1; i <= category.count; i++) {
      items.push({
        id: `eq-${String(globalIndex).padStart(3, '0')}`,
        name: category.name,
        status: 'available',
        createdAt: now,
      });
      globalIndex++;
    }
  }

  return items;
}
