import { test, expect, type Page, type Request } from '@playwright/test';
import { urlParam, findFilter } from '../utils/url';

const OPTION_CHIPS = [
  { name: 'Autism-friendly', groupId: '31', optionId: '181' },
  { name: 'Free cancellation', groupId: '18', optionId: '1' },
  { name: 'Breakfast', groupId: '10', optionId: '2' },
  { name: 'Accessible bathroom', groupId: '28', optionId: '147' },
  { name: 'Wheelchair-accessible', groupId: '28', optionId: '166' },
];

// wait for request that carries filters because website sends other requests on initial / next page load
const waitForFilteredSearch = (page: Page) =>
  page.waitForRequest(
    (req) => req.url().includes('/api/v1/offers/search') && req.url().includes('filters'),
  );

const searchParamsOf = (request: Request) => new URL(request.url()).searchParams;

test.describe('Filters request', () => {
  test.beforeEach(async ({ page }) => {
    // The cookie banner randomly closes the Guests modal and shifts the page so block it instead of dismissing it

    await page.route(/cookiefirst\.com/, (route) => route.abort());

    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    // The app writes the search state into the URL once it's initialized and it can take 10+ seconds
    await expect
      .poll(() => urlParam(page, 'search.pagination.limit'), { timeout: 30_000 })
      .not.toBeNull();
  });

  for (const chip of OPTION_CHIPS) {
    test(`'${chip.name}' chip adds its filter to the request`, async ({ page }) => {
      const chipButton = page.getByRole('button', { name: chip.name, exact: true });

      const requestPromise = waitForFilteredSearch(page);
      await chipButton.click();
      const params = searchParamsOf(await requestPromise);

      await expect(chipButton).toHaveAttribute('data-active', 'true');
      expect(findFilter(params, chip.groupId)).toMatchObject({
        type: 'AND',
        optionIds: [chip.optionId],
      });
    });
  }

  test(`'Total price <€500' chip adds a price range to the request`, async ({ page }) => {
    const chipButton = page.getByRole('button', { name: 'Total price <€500', exact: true });

    const requestPromise = waitForFilteredSearch(page);
    await chipButton.click();
    const params = searchParamsOf(await requestPromise);

    await expect(chipButton).toHaveAttribute('data-active', 'true');
    expect(findFilter(params, '24')).toMatchObject({
      type: 'PRICE_RANGE',
      rangeLower: '0',
      rangeUpper: '500',
    });
  });

  test('Checkbox in Filters dialog adds its filter to the request', async ({ page }) => {
    await page.getByTestId('main-search__big-filter-open--button').click();
    await page.getByRole('checkbox', { name: 'Wi-fi', exact: true }).check();

    const requestPromise = waitForFilteredSearch(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    const params = searchParamsOf(await requestPromise);

    await expect(page.getByRole('button', { name: 'Wi-fi', exact: true })).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(findFilter(params, '4')).toMatchObject({ type: 'AND', optionIds: ['12'] });
  });

  test('Total price range in Filters dialog is sent in the request', async ({ page }) => {
    await page.getByTestId('main-search__big-filter-open--button').click();
    await page.getByTestId('filter__price-min--input').fill('100');
    await page.getByTestId('filter__price-max--input').fill('500');

    const requestPromise = waitForFilteredSearch(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    const params = searchParamsOf(await requestPromise);

    await expect(
      page.getByRole('button', { name: 'Total price €100-€500', exact: true }),
    ).toHaveAttribute('data-active', 'true');
    expect(findFilter(params, '24')).toMatchObject({
      type: 'PRICE_RANGE',
      rangeLower: '100',
      rangeUpper: '500',
    });
  });

  test('Group checkbox sends all its options in the request', async ({ page }) => {
    await page.getByTestId('main-search__big-filter-open--button').click();

    const petsGroupCheckbox = page
      .getByRole('checkbox', { name: 'Pets', exact: true })
      .and(page.getByTestId('filter-11__title--checkbox'));
    const petsOptions = page
      .locator('section')
      .filter({ has: petsGroupCheckbox })
      .getByTestId('filter__option--checkbox');

    await petsGroupCheckbox.check();
    const checkedOptionsCount = await petsOptions
      .and(page.getByRole('checkbox', { checked: true }))
      .count();
    expect(checkedOptionsCount).toBeGreaterThan(0);

    const requestPromise = waitForFilteredSearch(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    const params = searchParamsOf(await requestPromise);

    const petsFilter = findFilter(params, '11');
    expect(petsFilter).toMatchObject({ type: 'AND' });
    expect(petsFilter?.optionIds).toHaveLength(checkedOptionsCount);
  });

  test('Two filters from different groups are both sent in the request', async ({ page }) => {
    await page.getByTestId('main-search__big-filter-open--button').click();
    await page.getByRole('checkbox', { name: 'Breakfast', exact: true }).check();
    await page
      .getByRole('checkbox', { name: 'Parking', exact: true })
      .and(page.getByTestId('filter__option--checkbox'))
      .check();

    const requestPromise = waitForFilteredSearch(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    const params = searchParamsOf(await requestPromise);

    expect(findFilter(params, '1')).toMatchObject({ type: 'AND', optionIds: ['13'] });
    expect(findFilter(params, '10')).toMatchObject({ type: 'AND', optionIds: ['2'] });
  });

  test('Unchecking a filter removes it from the request', async ({ page }) => {
    const wifiCheckbox = page.getByRole('checkbox', { name: 'Wi-fi', exact: true });
    const parkingCheckbox = page
      .getByRole('checkbox', { name: 'Parking', exact: true })
      .and(page.getByTestId('filter__option--checkbox'));
    const wifiChip = page.getByRole('button', { name: 'Wi-fi', exact: true });

    await page.getByTestId('main-search__big-filter-open--button').click();
    await wifiCheckbox.check();
    await parkingCheckbox.check();
    const bothRequestPromise = waitForFilteredSearch(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    const bothParams = searchParamsOf(await bothRequestPromise);

    expect(findFilter(bothParams, '4')).toMatchObject({ type: 'AND', optionIds: ['12'] });
    expect(findFilter(bothParams, '1')).toMatchObject({ type: 'AND', optionIds: ['13'] });

    await page.getByTestId('main-search__big-filter-open--button').click();
    await wifiCheckbox.uncheck();
    const parkingOnlyRequestPromise = page.waitForRequest(
      (req) =>
        req.url().includes('/api/v1/offers/search') &&
        findFilter(searchParamsOf(req), '1') !== null &&
        findFilter(searchParamsOf(req), '4') === null,
    );
    await page.getByRole('button', { name: 'Apply' }).click();
    const parkingOnlyParams = searchParamsOf(await parkingOnlyRequestPromise);

    await expect(wifiChip).toBeHidden();
    expect(findFilter(parkingOnlyParams, '1')).toMatchObject({ type: 'AND', optionIds: ['13'] });
  });
});
