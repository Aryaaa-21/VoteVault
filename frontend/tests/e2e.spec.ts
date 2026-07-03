import { test, expect } from '@playwright/test';

test.describe('VoteVault End-to-End Flows', () => {

  test('Wallet Connection Flow', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Click Connect Wallet in navbar
    const connectButton = page.locator('button:has-text("Connect Wallet")').first();
    await expect(connectButton).toBeVisible();
    await connectButton.click();
    
    // Check redirection to connect page
    await expect(page).toHaveURL(/.*connect/);
    
    // Click Lace Wallet connection
    const laceButton = page.locator('button:has-text("Connect Lace Wallet")');
    await expect(laceButton).toBeVisible();
    await laceButton.click();
    
    // Check redirection to dashboard after connection
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify wallet status address is visible in top navigation
    const walletAddressText = page.locator('nav').locator('text=0x89FB');
    await expect(walletAddressText).toBeVisible();
  });

  test('Voting Flow', async ({ page }) => {
    // Navigate to homepage and connect
    await page.goto('/');
    await page.locator('button:has-text("Connect Wallet")').first().click();
    
    const laceButton = page.locator('button:has-text("Connect Lace Wallet")');
    await expect(laceButton).toBeVisible();
    await laceButton.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Find the first active election and click Cast Your Vote
    const castVoteButton = page.locator('button:has-text("Cast Your Vote")').first();
    await expect(castVoteButton).toBeVisible();
    await castVoteButton.click();

    // Select the first option (Option A)
    const selectButton = page.locator('button:has-text("Select Choice")').first();
    await expect(selectButton).toBeVisible();
    await selectButton.click();

    // Submit vote
    const submitButton = page.locator('button:has-text("Confirm & Sign")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Verify submission succeeds and shows receipt
    await expect(page.locator('text=Ballot Submitted!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Nullifier Hash')).toBeVisible();

    // Return to dashboard
    await page.locator('button:has-text("Return to Dashboard")').click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Results Flow', async ({ page }) => {
    // Navigate to homepage and connect
    await page.goto('/');
    await page.locator('button:has-text("Connect Wallet")').first().click();
    
    const laceButton = page.locator('button:has-text("Connect Lace Wallet")');
    await expect(laceButton).toBeVisible();
    await laceButton.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Find the view results link under historical referendums (receipt icon button)
    const viewResultsLink = page.locator('button[aria-label="View Audit Receipt"]').first();
    await expect(viewResultsLink).toBeVisible();
    await viewResultsLink.click();

    // Verify it navigates to results and displays timeline graph + ledger table
    await expect(page).toHaveURL(/.*results/);
    await expect(page.locator('h1:has-text("Results:")')).toBeVisible();
    await expect(page.locator('h2:has-text("Participation Timeline")')).toBeVisible();
    await expect(page.locator('h2:has-text("Ledger Proof Verification")')).toBeVisible();
  });

});
