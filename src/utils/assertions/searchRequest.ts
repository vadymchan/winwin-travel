import { expect } from '@playwright/test';
import { testStep } from '../playwright/testStep';
import { findFilter } from '../url';
import { FILTER_GROUPS } from '../../constants/filters';

export async function assertOptionFilter(
  params: URLSearchParams,
  groupId: string,
  optionIds: string[],
) {
  await testStep(
    `Assert request has '${groupId}' filter with '${optionIds.join(', ')}' options`,
    () => {
      expect(findFilter(params, groupId)).toMatchObject({ type: 'AND', optionIds });
    },
  );
}

export async function assertFilterOptionsCount(
  params: URLSearchParams,
  groupId: string,
  count: number,
) {
  await testStep(`Assert request has '${groupId}' filter with '${count}' options`, () => {
    const filter = findFilter(params, groupId);
    expect(filter).toMatchObject({ type: 'AND' });
    expect(filter?.optionIds).toHaveLength(count);
  });
}

export async function assertPriceRangeFilter(
  params: URLSearchParams,
  rangeLower: string,
  rangeUpper: string,
) {
  await testStep(`Assert request has '${rangeLower}'-'${rangeUpper}' price range filter`, () => {
    expect(findFilter(params, FILTER_GROUPS.totalPrice.groupId)).toMatchObject({
      type: 'PRICE_RANGE',
      rangeLower,
      rangeUpper,
    });
  });
}
