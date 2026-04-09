import type { Equipment } from '@/types/schema';

const SEED_NAMES: string[] = [
  'Vector VN1600',
  'Kable DB9',
  'Adaptery OBD-II',
  'Terminatory CAN',
  'Rozgałęziatory Y',
  'Laptopy inżynierskie',
  'Tablety Rugged',
  'Data loggery',
  'Oscyloskopy cyfrowe',
  'Multimetry',
  'Kamery termowizyjne',
  'Zasilacze laboratoryjne',
  'Breakout boxy',
  'Termopary',
  'Akcelerometry',
  'Moduły pomiarowe ETAS',
  'Skanery 3D',
  'Ramiona pomiarowe CMM',
  'Klucze dynamometryczne',
  'Endoskopy techniczne',
];

export function buildSeedEquipment(): Equipment[] {
  const now = new Date().toISOString();
  return SEED_NAMES.map((name, index) => ({
    id: `eq-${String(index + 1).padStart(3, '0')}`,
    name,
    status: 'available' as const,
    createdAt: now,
  }));
}
