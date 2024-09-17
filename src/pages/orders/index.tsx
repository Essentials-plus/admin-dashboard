import Orders from '@/views/orders';
import { NextSeo } from 'next-seo';

const OrdersPage = () => {
  return (
    <>
      <NextSeo title="Orders" />
      <Orders />
    </>
  );
};

export default OrdersPage;
