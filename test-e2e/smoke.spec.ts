import { expect, test } from '@playwright/test';

test('loads the Tournamenter OBR home and scorer shells', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Bem vindo ao Tournamenter!')).toBeVisible();
  await page.goto('/tournamenter-obr');
  await expect(page.getByText('Aguardando...')).toBeVisible();
  await expect(page.getByText('Versão: Regional 2026.1.5')).toBeVisible();
});
