import type { Page } from '@playwright/test';
import { testStep } from '../utils/playwright/testStep';

export class BaseComponent {
  constructor(protected page: Page) {}

  protected async step<T>(title: string, stepToRun: () => Promise<T> | T): Promise<T> {
    return await testStep(title, stepToRun);
  }
}
