import { test } from './_fixtures/fixtures';
import { CAT_WEIGHT_URL, DEFAULT_PET_WEIGHT, PET_TYPES, PET_WEIGHTS } from '../src/constants/pets';

test.describe('Pets options', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.open();
    await searchPage.guestSelect.open();
    await searchPage.guestSelect.clickPetsIncrement();
  });

  for (const type of [PET_TYPES.dog, PET_TYPES.other]) {
    for (const weight of Object.values(PET_WEIGHTS)) {
      test(`${type.ui} + ${weight.ui} is reflected in the URL`, async ({ searchPage }) => {
        await searchPage.guestSelect.selectPetType(type.ui);
        await searchPage.guestSelect.selectPetWeight(weight.ui);

        await searchPage.guestSelect.assertPetType(type.ui);
        await searchPage.guestSelect.assertPetWeight(weight.ui);
        await searchPage.guestSelect.assertPetInUrl(type.url, weight.url);
      });
    }
  }

  test('Cat hides weight and sends weight=0 in search params', async ({ searchPage }) => {
    await searchPage.guestSelect.selectPetType(PET_TYPES.cat.ui);

    await searchPage.guestSelect.assertPetType(PET_TYPES.cat.ui);
    await searchPage.guestSelect.assertPetWeightHidden();
    await searchPage.guestSelect.assertPetInUrl(PET_TYPES.cat.url, CAT_WEIGHT_URL);
  });

  test('Switching type resets weight to default', async ({ searchPage }) => {
    await searchPage.guestSelect.selectPetType(PET_TYPES.other.ui);
    await searchPage.guestSelect.selectPetWeight(PET_WEIGHTS.moreThan20.ui);
    await searchPage.guestSelect.assertPetInUrl(PET_TYPES.other.url, PET_WEIGHTS.moreThan20.url);

    await searchPage.guestSelect.selectPetType(PET_TYPES.cat.ui);
    await searchPage.guestSelect.assertPetWeightHidden();
    await searchPage.guestSelect.assertPetInUrl(PET_TYPES.cat.url, CAT_WEIGHT_URL);

    await searchPage.guestSelect.selectPetType(PET_TYPES.dog.ui);
    await searchPage.guestSelect.assertPetWeight(DEFAULT_PET_WEIGHT.ui);
    await searchPage.guestSelect.assertPetInUrl(PET_TYPES.dog.url, DEFAULT_PET_WEIGHT.url);
  });
});
