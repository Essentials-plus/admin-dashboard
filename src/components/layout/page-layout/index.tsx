import { ReactNode } from 'react';

const PageLayout = ({
  children,
  pageTitle,
}: {
  children: ReactNode;
  pageTitle: string;
}) => {
  return (
    <>
      <div>
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </>
  );
};

export default PageLayout;
