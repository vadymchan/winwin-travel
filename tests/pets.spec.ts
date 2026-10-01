import { test, expect } from '@playwright/test';
import { urlParam } from '../utils/url';

const PET_TYPE_PARAM = 'search.guestQuantity.pets[0].type';
const PET_WEIGHT_PARAM = 'search.guestQuantity.pets[0].weight';

const PET_TYPES = [
  { ui: 'Dog', url: 'DOG' },
  { ui: 'Other', url: 'OTHER' },
];

const PET_WEIGHTS = [
  { ui: '<1 kg', url: '<1kg' },
  { ui: '1-5 kg', url: '1-5kg' },
  { ui: '5-10 kg', url: '5-10kg' },
  { ui: '10-15 kg', url: '10-15kg' },
  { ui: '15-20 kg', url: '15-20kg' },
  { ui: '>20 kg', url: '>20kg' },
];

test.describe('Pets options', () => {
  test.beforeEach(async ({ page }) => {
    // The cookie banner randomly closes the Guests modal and shifts the page so block it instead of dismissing it
    await page.route(/cookiefirst\.com/, (route) => route.abort());

    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    // The app writes the search state into the URL once it's initialized and it can take 10+ seconds
    await expect
      .poll(() => urlParam(page, 'search.pagination.limit'), { timeout: 30_000 })
      .not.toBeNull();

    await page.getByTestId('guests-select__open--button').click();
    await page.getByTestId('guests-select__pets-number--increment--button').click();
    // Wait for the pet to reach the URL, otherwise the next change can be overwritten by this update
    await expect.poll(() => urlParam(page, PET_TYPE_PARAM)).not.toBeNull();
  });

  for (const type of PET_TYPES) {
    for (const weight of PET_WEIGHTS) {
      test(`${type.ui} + ${weight.ui} is reflected in the URL`, async ({ page }) => {
        await page.getByTestId('guests-select__pet-type--select').click();
        await page.getByRole('option', { name: type.ui }).click();
        await expect(page.getByTestId('guests-select__pet-type--select')).toHaveText(type.ui);

        await page.getByTestId('guests-select__pet-weight--select').click();
        await page.getByRole('option', { name: weight.ui, exact: true }).click();
        await expect(page.getByTestId('guests-select__pet-weight--select')).toHaveText(weight.ui);

        await expect.poll(() => urlParam(page, PET_TYPE_PARAM)).toBe(type.url);
        await expect.poll(() => urlParam(page, PET_WEIGHT_PARAM)).toBe(weight.url);
      });
    }
  }

  test('Cat hides weight and sends weight=0 in search params', async ({ page }) => {
    await page.getByTestId('guests-select__pet-type--select').click();
    await page.getByRole('option', { name: 'Cat' }).click();
    await expect(page.getByTestId('guests-select__pet-type--select')).toHaveText('Cat');

    await expect(page.getByTestId('guests-select__pet-weight--select')).toBeHidden();

    await expect.poll(() => urlParam(page, PET_TYPE_PARAM)).toBe('CAT');
    await expect.poll(() => urlParam(page, PET_WEIGHT_PARAM)).toBe('0');
  });

  test('Switching type resets weight to default', async ({ page }) => {
    await page.getByTestId('guests-select__pet-type--select').click();
    await page.getByRole('option', { name: 'Other' }).click();
    await expect(page.getByTestId('guests-select__pet-type--select')).toHaveText('Other');
    await expect.poll(() => urlParam(page, PET_TYPE_PARAM)).toBe('OTHER');
    await page.getByTestId('guests-select__pet-weight--select').click();
    await page.getByRole('option', { name: '>20 kg', exact: true }).click();
    await expect(page.getByTestId('guests-select__pet-weight--select')).toHaveText('>20 kg');
    await expect.poll(() => urlParam(page, PET_WEIGHT_PARAM)).toBe('>20kg');

    await page.getByTestId('guests-select__pet-type--select').click();
    await page.getByRole('option', { name: 'Cat' }).click();
    await expect(page.getByTestId('guests-select__pet-type--select')).toHaveText('Cat');
    await expect.poll(() => urlParam(page, PET_TYPE_PARAM)).toBe('CAT');
    await expect(page.getByTestId('guests-select__pet-weight--select')).toBeHidden();
    await expect.poll(() => urlParam(page, PET_WEIGHT_PARAM)).toBe('0');

    await page.getByTestId('guests-select__pet-type--select').click();
    await page.getByRole('option', { name: 'Dog' }).click();
    await expect(page.getByTestId('guests-select__pet-type--select')).toHaveText('Dog');
    await expect.poll(() => urlParam(page, PET_TYPE_PARAM)).toBe('DOG');
    await expect(page.getByTestId('guests-select__pet-weight--select')).toHaveText('1-5 kg');
    await expect.poll(() => urlParam(page, PET_WEIGHT_PARAM)).toBe('1-5kg');
  });
});
