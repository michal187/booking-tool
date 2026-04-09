import { expect, test } from '@playwright/test';
import {
  emptyReservationsDb,
  overlappingReservationDb,
  readDbFixture,
  writeDbFixture,
} from '../utils/db-fixtures';

let originalDb = readDbFixture();

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  originalDb = readDbFixture();
});

test.afterAll(() => {
  writeDbFixture(originalDb);
});

test('happy path: a user can create a reservation from the UI', async ({ page }) => {
  writeDbFixture(emptyReservationsDb);

  await page.goto('/');
  await page.getByRole('button', { name: /vector vn1600/i }).click();
  await page.getByLabel('Od').fill('2026-04-10T08:00');
  await page.getByLabel('Do').fill('2026-04-10T09:00');
  await page.getByRole('button', { name: /zarezerwuj/i }).click();

  await expect(page.getByText('Rezerwacja utworzona pomyślnie!')).toBeVisible();
  await expect(page.getByText('Moje Rezerwacje')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vector VN1600' })).toBeVisible();
  await expect(
    page.locator('p.text-xs.text-slate-400').filter({ hasText: /08:00.*09:00/i })
  ).toBeVisible();
});

test('edge case: overlapping reservations are rejected', async ({ page }) => {
  writeDbFixture(overlappingReservationDb);

  await page.goto('/');
  await page.getByRole('button', { name: /vector vn1600/i }).click();
  await page.getByLabel('Od').fill('2026-04-10T09:00');
  await page.getByLabel('Do').fill('2026-04-10T11:00');
  await page.getByRole('button', { name: /zarezerwuj/i }).click();

  await expect(
    page.getByText(/Konflikt z istniejącą rezerwacją/i).last()
  ).toBeVisible();
  await expect(page.getByText(/Moje Rezerwacje/)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Nadchodzące rezerwacje (1)' })
  ).toBeVisible();
});
