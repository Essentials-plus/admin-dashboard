import Spinner from '@/components/ui/spinner';
import routes, { unAuthenticatedRoutes } from '@/config/routes';
import { appearanceColorOptions } from '@/constants/appearance-settings';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import useFirstRender from '@/hooks/useFirstRender';
import useSession from '@/hooks/useSession';
import { useTheme } from 'next-themes';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const { settings } = useAppearanceSettings();
  const { resolvedTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const isFirstRender = useFirstRender(200);
  const { accessToken } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isFirstRender) return;

    if (accessToken) {
      if (unAuthenticatedRoutes.includes(router.route)) {
        router.push(routes.home).then(() => {
          setIsLoading(false);
        });
        return;
      }

      setIsLoading(false);
      return;
    }

    if (!unAuthenticatedRoutes.includes(router.route)) {
      router.push(routes.login).then(() => {
        setIsLoading(false);
      });
      return;
    } else {
      setIsLoading(false);
    }
  }, [accessToken, isFirstRender, router]);

  const globalStyles = useMemo(() => {
    const selectedColor = appearanceColorOptions.find(
      (option) => option.value === settings.color
    );
    return (
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          --radius: ${settings.radius}rem;
          --success: 142 71% 45%;
          --success-foreground: 0 0% 98%;

          ${resolvedTheme === 'light'
            ? selectedColor?.variablesLight
            : selectedColor?.variablesDark}
        }
      `}</style>
    );
  }, [settings.color, settings.radius, resolvedTheme]);

  if (isLoading) {
    return (
      <>
        {globalStyles}
        <div className="flex h-screen items-center justify-center">
          <Spinner className="size-10" />
        </div>
      </>
    );
  }
  return (
    <>
      {globalStyles}
      {children}
    </>
  );
};

export default AuthWrapper;
