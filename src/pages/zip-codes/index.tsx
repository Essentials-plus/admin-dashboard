import ZipCodes from '@/views/zip-codes';
import { NextSeo } from 'next-seo';

const ZipCodesPage = () => {
  return (
    <>
      <NextSeo title="Zip codes" />
      <ZipCodes />
    </>
  );
};

export default ZipCodesPage;
