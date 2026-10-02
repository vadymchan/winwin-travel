import { test } from '@playwright/test';

export async function testStep<T>(testTitle: string, stepToRun: () => Promise<T> | T) {
  return await test.step(testTitle, stepToRun);
}
