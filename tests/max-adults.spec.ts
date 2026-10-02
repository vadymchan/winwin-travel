import { test } from './_fixtures/fixtures';

const MAX_ADULTS = 10;

test.describe('Max adults selection', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.open();
    await searchPage.guestSelect.open();
  });

  test('Clicking up to max disables only Increment and updates the URL', async ({ searchPage }) => {
    const initialAdults = await searchPage.guestSelect.getAdultsValue();
    for (let value = initialAdults; value < MAX_ADULTS; value++) {
      await searchPage.guestSelect.clickAdultsIncrement();
    }

    await searchPage.guestSelect.assertAdultsValue(String(MAX_ADULTS));
    await searchPage.guestSelect.assertAdultsIncrementDisabled();
    await searchPage.guestSelect.assertAdultsDecrementEnabled();
    await searchPage.guestSelect.assertAdultsInUrl(String(MAX_ADULTS));
  });

  test('Typing max value is accepted', async ({ searchPage }) => {
    await searchPage.guestSelect.typeAdults(String(MAX_ADULTS));

    await searchPage.guestSelect.assertAdultsValue(String(MAX_ADULTS));
    await searchPage.guestSelect.assertAdultsIncrementDisabled();
    await searchPage.guestSelect.assertAdultsDecrementEnabled();
  });

  test('Typing a value above max drops the last digit', async ({ searchPage }) => {
    const aboveMax = MAX_ADULTS + 1;
    const expectedValue = Math.floor(aboveMax / 10);

    await searchPage.guestSelect.typeAdults(String(aboveMax));

    await searchPage.guestSelect.assertAdultsValue(String(expectedValue));
  });
});
