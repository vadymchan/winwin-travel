import { type Page } from '@playwright/test';
import { testStep } from '../utils/playwright/testStep';

export class BasePage {
  constructor(
    protected page: Page,
    protected path: string,
  ) {}

  protected async step<T>(title: string, stepToRun: () => Promise<T> | T): Promise<T> {
    return await testStep(title, stepToRun);
  }

  async open() {
    await this.step(`Open '${this.path}'`, async () => {
      // default 'load' is slow
      await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    });
  }
}
