export const PET_TYPES = {
  dog: { ui: 'Dog', url: 'DOG' },
  cat: { ui: 'Cat', url: 'CAT' },
  other: { ui: 'Other', url: 'OTHER' },
};

export const PET_WEIGHTS = {
  lessThan1: { ui: '<1 kg', url: '<1kg' },
  from1To5: { ui: '1-5 kg', url: '1-5kg' },
  from5To10: { ui: '5-10 kg', url: '5-10kg' },
  from10To15: { ui: '10-15 kg', url: '10-15kg' },
  from15To20: { ui: '15-20 kg', url: '15-20kg' },
  moreThan20: { ui: '>20 kg', url: '>20kg' },
};

export const DEFAULT_PET_WEIGHT = PET_WEIGHTS.from1To5;
export const CAT_WEIGHT_URL = '0';
