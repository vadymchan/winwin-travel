import { expect, type Locator, type Page } from '@playwright/test';
import { BaseComponent } from '../BaseComponent';
import { urlParam } from '../../utils/url';
import { SEARCH_PARAMS } from '../../constants/searchParams';

export class GuestSelectComponent extends BaseComponent {
  private readonly openButton: Locator;
  private readonly adultsInput: Locator;
  private readonly adultsIncrementButton: Locator;
  private readonly adultsDecrementButton: Locator;
  private readonly petsIncrementButton: Locator;
  private readonly petTypeSelect: Locator;
  private readonly petWeightSelect: Locator;

  constructor(page: Page) {
    super(page);

    this.openButton = page.getByTestId('guests-select__open--button');
    this.adultsInput = page.getByTestId('guests-select__adults-number--input');
    this.adultsIncrementButton = page.getByTestId(
      'guests-select__adults-number--increment--button',
    );
    this.adultsDecrementButton = page.getByTestId(
      'guests-select__adults-number--decrement--button',
    );
    this.petsIncrementButton = page.getByTestId('guests-select__pets-number--increment--button');
    this.petTypeSelect = page.getByTestId('guests-select__pet-type--select');
    this.petWeightSelect = page.getByTestId('guests-select__pet-weight--select');
  }

  async open() {
    await this.step(`Open Guests dialog`, async () => {
      await this.openButton.click();
    });
  }

  async getAdultsValue() {
    return await this.step(`Get Adults input value`, async () => {
      return Number(await this.adultsInput.inputValue());
    });
  }

  async clickAdultsIncrement() {
    await this.step(`Click Adults increment button`, async () => {
      const expected = (await this.getAdultsValue()) + 1;
      await this.adultsIncrementButton.click();
      // wait for the new value, otherwise the next fast click gets lost
      await expect(this.adultsInput).toHaveValue(String(expected));
    });
  }

  async typeAdults(value: string) {
    await this.step(`Type '${value}' into Adults input`, async () => {
      // Backspace doesn't clear the input, so select all text
      await this.adultsInput.press('ControlOrMeta+a');
      await this.adultsInput.pressSequentially(value);
    });
  }

  async clickPetsIncrement() {
    await this.step(`Click Pets increment button`, async () => {
      await this.petsIncrementButton.click();
      // wait for the pet type param in the URL, otherwise the next change can overwrite it
      await expect.poll(() => urlParam(this.page, SEARCH_PARAMS.petType)).not.toBeNull();
    });
  }

  async selectPetType(petType: string) {
    await this.step(`Select '${petType}' option in pet type select`, async () => {
      await this.petTypeSelect.click();
      await this.page.getByRole('option', { name: petType, exact: true }).click();
    });
  }

  async selectPetWeight(petWeight: string) {
    await this.step(`Select '${petWeight}' option in pet weight select`, async () => {
      await this.petWeightSelect.click();
      await this.page.getByRole('option', { name: petWeight, exact: true }).click();
    });
  }

  async assertAdultsValue(value: string) {
    await this.step(`Assert Adults input has '${value}' value`, async () => {
      await expect(this.adultsInput).toHaveValue(value);
    });
  }

  async assertAdultsIncrementDisabled() {
    await this.step(`Assert Adults increment button is disabled`, async () => {
      await expect(this.adultsIncrementButton).toBeDisabled();
    });
  }

  async assertAdultsDecrementEnabled() {
    await this.step(`Assert Adults decrement button is enabled`, async () => {
      await expect(this.adultsDecrementButton).toBeEnabled();
    });
  }

  async assertPetType(petType: string) {
    await this.step(`Assert pet type select has '${petType}' text`, async () => {
      await expect(this.petTypeSelect).toHaveText(petType);
    });
  }

  async assertPetWeight(petWeight: string) {
    await this.step(`Assert pet weight select has '${petWeight}' text`, async () => {
      await expect(this.petWeightSelect).toHaveText(petWeight);
    });
  }

  async assertPetWeightHidden() {
    await this.step(`Assert pet weight select is hidden`, async () => {
      await expect(this.petWeightSelect).toBeHidden();
    });
  }

  async assertAdultsInUrl(adults: string) {
    await this.step(
      `Assert '${SEARCH_PARAMS.adultsQuantity}' URL param has '${adults}' value`,
      async () => {
        await expect.poll(() => urlParam(this.page, SEARCH_PARAMS.adultsQuantity)).toBe(adults);
      },
    );
  }

  async assertPetInUrl(petType: string, petWeight: string) {
    await this.step(
      `Assert '${SEARCH_PARAMS.petType}' URL param has '${petType}' value and '${SEARCH_PARAMS.petWeight}' has '${petWeight}' value`,
      async () => {
        await expect.poll(() => urlParam(this.page, SEARCH_PARAMS.petType)).toBe(petType);
        await expect.poll(() => urlParam(this.page, SEARCH_PARAMS.petWeight)).toBe(petWeight);
      },
    );
  }
}
