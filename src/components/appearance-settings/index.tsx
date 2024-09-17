import { Button } from '@/components/ui/button';
import Circle from '@/components/ui/circle';
import {
  appearanceColorOptions,
  appearanceRadiusOptions,
} from '@/constants/appearance-settings';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const AppearanceSettings = () => {
  const { setAppearanceSettings, settings, removeAppearanceSettings } =
    useAppearanceSettings();
  const { themes, setTheme, theme } = useTheme();
  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm">Color</p>
        <RadioGroup
          orientation="horizontal"
          value={settings.color}
          onValueChange={(value) => {
            setAppearanceSettings((prev) => ({
              ...prev,
              color: value as any,
            }));
          }}
          className="mt-2.5 grid grid-cols-3 gap-2 text-xs"
        >
          {appearanceColorOptions.map((option) => (
            <RadioGroupItem
              className="flex items-center justify-center gap-2 rounded-md border border-muted px-3 py-1.5 outline-none ring-accent-foreground ring-offset-1 ring-offset-accent duration-200 data-[state=checked]:bg-accent-foreground data-[state=checked]:text-accent hover:bg-muted hover:data-[state=checked]:!bg-accent-foreground focus-visible:ring-1"
              value={option.value}
              key={option.value}
            >
              <Circle
                style={{ background: option.primaryColor }}
                className="w-4"
              />
              {option.label}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </div>
      <div>
        <p className="text-sm">Radius</p>

        <RadioGroup
          orientation="horizontal"
          value={settings.radius.toString()}
          onValueChange={(value) => {
            setAppearanceSettings((prev) => ({
              ...prev,
              radius: Number(value) as any,
            }));
          }}
          className="mt-2.5 grid grid-cols-5 gap-2 text-xs"
        >
          {appearanceRadiusOptions.map((option) => (
            <RadioGroupItem
              className="rounded-md border border-muted px-3 py-1.5 outline-none ring-accent-foreground ring-offset-1 ring-offset-accent duration-200 data-[state=checked]:bg-accent-foreground data-[state=checked]:text-accent hover:bg-muted hover:data-[state=checked]:!bg-accent-foreground focus-visible:ring-1"
              value={option.value.toString()}
              key={option.value}
            >
              {option.label}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </div>
      <div>
        <p className="text-sm">Mode</p>

        <RadioGroup
          orientation="horizontal"
          value={theme}
          onValueChange={(value) => {
            setTheme(value);
          }}
          className="mt-2.5 grid grid-cols-3 gap-2 text-xs"
        >
          {themes.map((theme) => (
            <RadioGroupItem
              className="flex items-center justify-center gap-2 rounded-md border border-muted px-3 py-1.5 capitalize outline-none ring-accent-foreground ring-offset-1 ring-offset-accent duration-200 data-[state=checked]:bg-accent-foreground data-[state=checked]:text-accent hover:bg-muted hover:data-[state=checked]:!bg-accent-foreground focus-visible:ring-1"
              value={theme}
              key={theme}
            >
              {theme === 'light' && <Sun className="size-3.5 shrink-0" />}
              {theme === 'dark' && <Moon className="size-3.5 shrink-0" />}
              {theme === 'system' && <Monitor className="size-3.5 shrink-0" />}
              {theme}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Button
          onClick={() => {
            removeAppearanceSettings();
            setTheme('system');
          }}
          size={'sm'}
          variant={'outline'}
          className="w-full"
        >
          Reset theme
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
