import { test, expect } from '@playwright/test';
import { urlParam } from '../utils/url';

const MAX_ADULTS = 10;

test.describe('Max adults selection', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: make a fixture
    await page.route(/cookiefirst\.com/, (route) => route.abort());

    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    // The app writes the search state into the URL once it's initialized and it can take 10+ seconds
    await expect
      .poll(() => urlParam(page, 'search.pagination.limit'), { timeout: 30_000 })
      .not.toBeNull();

    await page.getByTestId('guests-select__open--button').click();
  });

  test('Clicking up to max disables only Increment and updates the URL', async ({ page }) => {
    const incrementButton = page.getByTestId('guests-select__adults-number--increment--button');
    const decrementButton = page.getByTestId('guests-select__adults-number--decrement--button');

    const adultsInput = page.getByTestId('guests-select__adults-number--input');
    const initialAdults = Number(await adultsInput.inputValue());

    for (let value = initialAdults + 1; value <= MAX_ADULTS; value++) {
      await incrementButton.click();
      await expect(adultsInput).toHaveValue(String(value));
    }

    await expect(incrementButton).toBeDisabled();
    await expect(decrementButton).toBeEnabled();

    await expect
      .poll(() => urlParam(page, 'search.guestQuantity.adultsQuantity'))
      .toBe(String(MAX_ADULTS));
  });

  test('Typing max value is accepted', async ({ page }) => {
    const adultsInput = page.getByTestId('guests-select__adults-number--input');
    const incrementButton = page.getByTestId('guests-select__adults-number--increment--button');
    const decrementButton = page.getByTestId('guests-select__adults-number--decrement--button');

    await adultsInput.press('ControlOrMeta+a');
    await adultsInput.pressSequentially(String(MAX_ADULTS));

    await expect(adultsInput).toHaveValue(String(MAX_ADULTS));
    await expect(incrementButton).toBeDisabled();
    await expect(decrementButton).toBeEnabled();
  });

  test('Typing a value above max drops the last digit', async ({ page }) => {
    const aboveMax = MAX_ADULTS + 1;
    const expectedValue = Math.floor(aboveMax / 10);
    const adultsInput = page.getByTestId('guests-select__adults-number--input');

    await adultsInput.press('ControlOrMeta+a');
    await adultsInput.pressSequentially(String(aboveMax));

    await expect(adultsInput).toHaveValue(String(expectedValue));
  });
});
