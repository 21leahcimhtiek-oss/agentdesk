import { test, expect } from '@playwright/test';

test.describe('Agent Run Flow', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('AgentDesk')).toBeVisible();
    await expect(page.getByText('AI agents in production')).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('signup page renders form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Organization name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('pricing section visible on landing', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Starter')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });
});