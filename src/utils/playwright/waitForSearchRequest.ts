import type { Page } from '@playwright/test';
import { searchParamsOf } from '../url';

// website sends other search requests on initial / next page load, so wait only for the one with filters by default
const hasFilters = (params: URLSearchParams) => params.has('filters[0].id');

export const waitForSearchRequest = async (
  page: Page,
  isExpected: (params: URLSearchParams) => boolean = hasFilters,
) => {
  const request = await page.waitForRequest(
    (req) => req.url().includes('/api/v1/offers/search') && isExpected(searchParamsOf(req)),
  );

  return searchParamsOf(request);
};
