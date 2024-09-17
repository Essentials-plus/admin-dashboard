import { UserStatus } from '@/types/api-responses/users';

export const userStatusOptions: { label: string; value: UserStatus }[] = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Blocked',
    value: 'blocked',
  },
];

export const activityLevels = [
  {
    value: '1.2',
    label: 'Weinig of geen opleiding, kantoorwerk',
  },
  {
    value: '1.375',
    label: 'Lichte training/sport 1-3 dagen per week',
  },
  {
    value: '1.55',
    label: 'Gemiddeld training/sport 3-5 dagen per week',
  },
  {
    value: '1.75',
    label: 'Zwaar trainen/sporten 6-7 dagen per week',
  },
  {
    value: '1.9',
    label: 'Zware dagelijkse training/sport plus fysiek werk',
  },
];

export const goals = [
  {
    value: '-500',
    label: 'Vet verbranden en spieren behouden',
  },
  {
    value: '0',
    label: 'Gewicht behouden',
  },
  {
    value: '500',
    label: 'Aankomen / spieropbouwen',
  },
];

export const genders = [
  {
    value: 'male',
    label: 'Mannelijk',
  },
  {
    value: 'female',
    label: 'Vrouwelijk',
  },
];
