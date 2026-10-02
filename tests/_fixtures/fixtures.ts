import { test as base } from '@playwright/test';
import { SearchPage } from '../../src/pages/SearchPage';

export { expect } from '@playwright/test';

export const test = base.extend<{ skipCookiesBanner: void; searchPage: SearchPage }>({
  skipCookiesBanner: [
    async ({ page }, use) => {
      await page.route(/cookiefirst\.com/, (route) => route.abort());

      await use();
    },
    { auto: true },
  ],
  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);

    await use(searchPage);
  },
});
