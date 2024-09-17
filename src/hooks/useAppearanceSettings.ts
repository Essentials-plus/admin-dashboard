import {
  appearanceColorOptions,
  appearanceRadiusOptions,
} from '@/constants/appearance-settings';
import { useLocalStorage } from '@mantine/hooks';

type DefaultValue = {
  radius: (typeof appearanceRadiusOptions)[number]['value'];
  color: (typeof appearanceColorOptions)[number]['value'];
};

export const useAppearanceSettings = () => {
  const [appearanceSettings, setAppearanceSettings, removeAppearanceSettings] =
    useLocalStorage<DefaultValue>({
      key: 'appearance_settings',
      defaultValue: {
        radius: 0.5,
        color: 'neutral',
      },
    });
  return {
    settings: appearanceSettings,
    setAppearanceSettings,
    removeAppearanceSettings,
  };
};
