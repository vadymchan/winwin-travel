import type { Page } from '@playwright/test';

export const urlParam = (page: Page, key: string) => new URL(page.url()).searchParams.get(key);

const collectOptionIds = (params: URLSearchParams, filterIndex: number) => {
  const optionIds = [];
  for (let i = 0; params.has(`filters[${filterIndex}].optionIDs[${i}]`); i++) {
    optionIds.push(params.get(`filters[${filterIndex}].optionIDs[${i}]`));
  }
  return optionIds;
};

export function findFilter(params: URLSearchParams, groupId: string) {
  for (let i = 0; params.has(`filters[${i}].id`); i++) {
    if (params.get(`filters[${i}].id`) === groupId) {
      return {
        type: params.get(`filters[${i}].type`),
        optionIds: collectOptionIds(params, i),
        rangeLower: params.get(`filters[${i}].rangeLower`),
        rangeUpper: params.get(`filters[${i}].rangeUpper`),
      };
    }
  }

  return null;
}
