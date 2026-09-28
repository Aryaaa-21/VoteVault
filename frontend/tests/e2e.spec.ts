import { test, expect } from '@playwright/test';

test.describe('VoteVault End-to-End Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Emulate the 1AM extension injection so the browser suite exercises the
    // real DApp Connector path without requiring an installed extension.
    await page.addInitScript(() => {
      (window as any).midnight = {
        'test-1am-wallet': {
          name: '1AM',
          rdns: 'xyz.1am.wallet',
          icon: '',
          apiVersion: '4.0.1',
          connect: async () => ({
            getUnshieldedAddress: async () => ({
              unshieldedAddress: 'mn_addr_test_1am_votevault',
            }),
            getConfiguration: async () => ({ networkId: 'preprod' }),
          }),
        },
      };
    });
  });

  test('Wallet Connection Flow', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Connect Wallet")').first().click();
    await expect(page).toHaveURL(/.*connect/);

    const oneAmButton = page.locator('button:has-text("Connect 1AM Wallet")');
    await expect(oneAmButton).toBeVisible();
    await oneAmButton.click();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('nav').locator('text=mn_addr_te')).toBeVisible();
  });

  test('Voting Flow', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Connect Wallet")').first().click();
    await page.locator('button:has-text("Connect 1AM Wallet")').click();
    await expect(page).toHaveURL(/.*dashboard/);

    const castVoteButton = page.locator('button:has-text("Cast Your Vote")').first();
    await expect(castVoteButton).toBeVisible();
    await castVoteButton.click();

    await page.locator('button:has-text("Select Choice")').first().click();
    await page.locator('button:has-text("Confirm & Sign")').click();

    await expect(page.locator('text=Ballot Submitted!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Nullifier Hash')).toBeVisible();

    await page.locator('button:has-text("Return to Dashboard")').click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Results Flow', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Connect Wallet")').first().click();
    await page.locator('button:has-text("Connect 1AM Wallet")').click();
    await expect(page).toHaveURL(/.*dashboard/);

    await page.locator('button[aria-label="View Audit Receipt"]').first().click();
    await expect(page).toHaveURL(/.*results/);
    await expect(page.locator('h1:has-text("Results:")')).toBeVisible();
    await expect(page.locator('h2:has-text("Participation Timeline")')).toBeVisible();
    await expect(page.locator('h2:has-text("Ledger Proof Verification")')).toBeVisible();
  });
});
