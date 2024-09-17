import CouponCodes from '@/views/coupon-codes';
import { NextSeo } from 'next-seo';

const CouponCodesPage = () => {
  return (
    <>
      <NextSeo title="Coupon codes" />
      <CouponCodes />
    </>
  );
};

export default CouponCodesPage;
