import { test } from './_fixtures/fixtures';
import { findFilter } from '../src/utils/url';
import {
  assertFilterOptionsCount,
  assertOptionFilter,
  assertPriceRangeFilter,
} from '../src/utils/assertions/searchRequest';
import { FILTER_GROUPS, FILTERS } from '../src/constants/filters';

const OPTION_CHIPS = [
  FILTERS.autismFriendly,
  FILTERS.freeCancellation,
  FILTERS.breakfast,
  FILTERS.accessibleBathroom,
  FILTERS.wheelchairAccessible,
];

test.describe('Filters request', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.open();
  });

  for (const chip of OPTION_CHIPS) {
    test(`'${chip.name}' chip adds its filter to the request`, async ({ searchPage }) => {
      const params = await searchPage.quickFilter.clickChipAndWaitForSearch(chip.name);

      await searchPage.quickFilter.assertChipActive(chip.name);
      await assertOptionFilter(params, chip.groupId, [chip.optionId]);
    });
  }

  test(`'Total price <€500' chip adds a price range to the request`, async ({ searchPage }) => {
    const params = await searchPage.quickFilter.clickChipAndWaitForSearch('Total price <€500');

    await searchPage.quickFilter.assertChipActive('Total price <€500');
    await assertPriceRangeFilter(params, '0', '500');
  });

  test('Checkbox in Filters dialog adds its filter to the request', async ({ searchPage }) => {
    await searchPage.filterDialog.open();
    await searchPage.filterDialog.checkOption(FILTERS.wifi.name);

    const params = await searchPage.filterDialog.clickApplyAndWaitForSearch();

    await searchPage.quickFilter.assertChipActive(FILTERS.wifi.name);
    await assertOptionFilter(params, FILTERS.wifi.groupId, [FILTERS.wifi.optionId]);
  });

  test('Total price range in Filters dialog is sent in the request', async ({ searchPage }) => {
    await searchPage.filterDialog.open();
    await searchPage.filterDialog.fillMinPrice('100');
    await searchPage.filterDialog.fillMaxPrice('500');

    const params = await searchPage.filterDialog.clickApplyAndWaitForSearch();

    await searchPage.quickFilter.assertChipActive('Total price €100-€500');
    await assertPriceRangeFilter(params, '100', '500');
  });

  test('Group checkbox sends all its options in the request', async ({ searchPage }) => {
    await searchPage.filterDialog.open();
    await searchPage.filterDialog.checkGroup(FILTER_GROUPS.pets.name);
    await searchPage.filterDialog.assertGroupOptionsChecked(FILTER_GROUPS.pets.name);
    const checkedOptionsCount = await searchPage.filterDialog.getGroupCheckedOptionsCount(
      FILTER_GROUPS.pets.name,
    );

    const params = await searchPage.filterDialog.clickApplyAndWaitForSearch();

    await assertFilterOptionsCount(params, FILTER_GROUPS.pets.groupId, checkedOptionsCount);
  });

  test('Two filters from different groups are both sent in the request', async ({ searchPage }) => {
    await searchPage.filterDialog.open();
    await searchPage.filterDialog.checkOption(FILTERS.breakfast.name);
    await searchPage.filterDialog.checkOption(FILTERS.parking.name);

    const params = await searchPage.filterDialog.clickApplyAndWaitForSearch();

    await assertOptionFilter(params, FILTERS.parking.groupId, [FILTERS.parking.optionId]);
    await assertOptionFilter(params, FILTERS.breakfast.groupId, [FILTERS.breakfast.optionId]);
  });

  test('Unchecking a filter removes it from the request', async ({ searchPage }) => {
    await searchPage.filterDialog.open();
    await searchPage.filterDialog.checkOption(FILTERS.wifi.name);
    await searchPage.filterDialog.checkOption(FILTERS.parking.name);
    const bothParams = await searchPage.filterDialog.clickApplyAndWaitForSearch();

    await assertOptionFilter(bothParams, FILTERS.wifi.groupId, [FILTERS.wifi.optionId]);
    await assertOptionFilter(bothParams, FILTERS.parking.groupId, [FILTERS.parking.optionId]);

    await searchPage.filterDialog.open();
    await searchPage.filterDialog.uncheckOption(FILTERS.wifi.name);
    const parkingOnlyParams = await searchPage.filterDialog.clickApplyAndWaitForSearch(
      (params) =>
        findFilter(params, FILTERS.parking.groupId) !== null &&
        findFilter(params, FILTERS.wifi.groupId) === null,
    );

    await searchPage.quickFilter.assertChipHidden(FILTERS.wifi.name);
    await assertOptionFilter(parkingOnlyParams, FILTERS.parking.groupId, [
      FILTERS.parking.optionId,
    ]);
  });
});
