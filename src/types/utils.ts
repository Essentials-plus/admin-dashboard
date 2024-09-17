// export type Optionalize<T> = {
//   [K in keyof T]?: T[K] | '';
// };

import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';

export type Optionalize<T> = {
  [K in keyof T]?: T[K] extends string | number ? T[K] | '' : T[K];
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  // eslint-disable-next-line no-unused-vars
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
