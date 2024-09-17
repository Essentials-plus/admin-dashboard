import AuthWrapper from '@/components/auth-wrapper';
import Layout from '@/components/layout';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import Spinner from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/lib/utils';
import '@/styles/globals.css';
import { AppPropsWithLayout } from '@/types/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Check, Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 5, // 5 seconds
    },
    mutations: {
      onError(error) {
        toast.error(getApiErrorMessage(error));
      },
    },
  },
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ??
    ((page) => {
      return <Layout>{page}</Layout>;
    });

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryDevtools initialIsOpen={false} />

          <AuthWrapper>{getLayout(<Component {...pageProps} />)}</AuthWrapper>
          <Toaster
            visibleToasts={5}
            toastOptions={{
              classNames: {
                description: 'text-xs opacity-80',
                closeButton:
                  'static shrink-0 order-3 ml-auto translate-y-0 rounded-sm bg-muted hover:!bg-muted border-none hover:ring-1 ring-muted-foreground/50 duration-100',
              },
            }}
            closeButton
            icons={{
              error: <OctagonAlert className="size-4" />,
              info: <Info className="size-4" />,
              warning: <TriangleAlert className="size-4" />,
              success: <Check className="size-4" />,
              loading: <Spinner className="size-4" />,
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
