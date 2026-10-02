import { expect, type Locator, type Page } from '@playwright/test';
import { BaseComponent } from '../BaseComponent';
import { waitForSearchRequest } from '../../utils/playwright/waitForSearchRequest';

export class FilterDialogComponent extends BaseComponent {
  private readonly openButton: Locator;
  private readonly dialog: Locator;
  private readonly minPriceInput: Locator;
  private readonly maxPriceInput: Locator;
  private readonly applyButton: Locator;

  constructor(page: Page) {
    super(page);

    this.openButton = page.getByTestId('main-search__big-filter-open--button');
    this.dialog = page.getByTestId('big-filter--modal');
    this.minPriceInput = this.dialog.getByTestId('filter__price-min--input');
    this.maxPriceInput = this.dialog.getByTestId('filter__price-max--input');
    this.applyButton = this.dialog.getByRole('button', { name: 'Apply', exact: true });
  }

  private optionCheckbox(name: string) {
    return (
      this.dialog
        .getByRole('checkbox', { name, exact: true })
        // use this because some groups have an option with the same name (e.g. 'Parking')
        .and(this.page.getByTestId('filter__option--checkbox'))
    );
  }

  private groupCheckbox(name: string) {
    return this.page
      .getByRole('checkbox', { name, exact: true })
      .and(this.page.getByTestId(/__title--checkbox$/));
  }

  private groupOptions(name: string) {
    return (
      this.dialog
        // take only the innermost section (where the checkbox options are)
        .locator('section:not(:has(section))')
        .filter({ has: this.groupCheckbox(name) })
        .getByTestId('filter__option--checkbox')
    );
  }

  async open() {
    await this.step(`Open 'Filters' dialog`, async () => {
      await this.openButton.click();
    });
  }

  async checkOption(name: string) {
    await this.step(`Check '${name}' option checkbox`, async () => {
      await this.optionCheckbox(name).check();
    });
  }

  async uncheckOption(name: string) {
    await this.step(`Uncheck '${name}' option checkbox`, async () => {
      await this.optionCheckbox(name).uncheck();
    });
  }

  async checkGroup(name: string) {
    await this.step(`Check '${name}' group checkbox`, async () => {
      await this.groupCheckbox(name).check();
    });
  }

  async getGroupCheckedOptionsCount(name: string) {
    return await this.step(`Get '${name}' group checked options count`, async () => {
      return await this.groupOptions(name)
        .and(this.page.getByRole('checkbox', { checked: true }))
        .count();
    });
  }

  async fillMinPrice(price: string) {
    await this.step(`Fill min price input with '${price}'`, async () => {
      await this.minPriceInput.fill(price);
    });
  }

  async fillMaxPrice(price: string) {
    await this.step(`Fill max price input with '${price}'`, async () => {
      await this.maxPriceInput.fill(price);
    });
  }

  async clickApplyAndWaitForSearch(isExpected?: (params: URLSearchParams) => boolean) {
    return await this.step(`Click 'Apply' button and wait for search request`, async () => {
      const searchParamsPromise = waitForSearchRequest(this.page, isExpected);
      await this.applyButton.click();
      return await searchParamsPromise;
    });
  }

  async assertGroupOptionsChecked(name: string) {
    await this.step(`Assert all '${name}' group options are checked`, async () => {
      const options = this.groupOptions(name);
      await expect(options).not.toHaveCount(0);
      await expect(options.and(this.page.getByRole('checkbox', { checked: false }))).toHaveCount(0);
    });
  }
}
