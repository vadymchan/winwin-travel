import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { urlParam } from '../utils/url';
import { SEARCH_PARAMS } from '../constants/searchParams';
import { FilterDialogComponent } from '../components/search/FilterDialogComponent';
import { GuestSelectComponent } from '../components/search/GuestSelectComponent';
import { QuickFilterComponent } from '../components/search/QuickFilterComponent';

export class SearchPage extends BasePage {
  public filterDialog: FilterDialogComponent;
  public guestSelect: GuestSelectComponent;
  public quickFilter: QuickFilterComponent;

  constructor(page: Page) {
    super(page, '/app');

    this.filterDialog = new FilterDialogComponent(page);
    this.guestSelect = new GuestSelectComponent(page);
    this.quickFilter = new QuickFilterComponent(page);
  }

  async open() {
    await super.open();
    await this.step(`Wait for '${this.path}' to initialize`, async () => {
      // the app writes the search state into the URL once it's ready and it can take 10+ s
      await expect
        .poll(() => urlParam(this.page, SEARCH_PARAMS.paginationLimit), { timeout: 30_000 })
        .not.toBeNull();
    });
  }
}
