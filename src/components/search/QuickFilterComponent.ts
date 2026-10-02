import { expect, type Locator, type Page } from '@playwright/test';
import { BaseComponent } from '../BaseComponent';
import { waitForSearchRequest } from '../../utils/playwright/waitForSearchRequest';

export class QuickFilterComponent extends BaseComponent {
  private readonly container: Locator;

  constructor(page: Page) {
    super(page);

    this.container = page.getByTestId('main-search__recommended-filters--container');
  }

  private chip(name: string) {
    return this.container.getByRole('button', { name, exact: true });
  }

  async clickChipAndWaitForSearch(name: string) {
    return await this.step(`Click '${name}' chip and wait for search request`, async () => {
      const searchParamsPromise = waitForSearchRequest(this.page);
      await this.chip(name).click();
      return await searchParamsPromise;
    });
  }

  async assertChipActive(name: string) {
    await this.step(`Assert '${name}' chip is active`, async () => {
      await expect(this.chip(name)).toHaveAttribute('data-active', 'true');
    });
  }

  async assertChipHidden(name: string) {
    await this.step(`Assert '${name}' chip is hidden`, async () => {
      await expect(this.chip(name)).toBeHidden();
    });
  }
}
