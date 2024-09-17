import EditOrder from '@/views/edit-order';
import { NextSeo } from 'next-seo';

const EditOrderPage = () => {
  return (
    <>
      <NextSeo title="Edit order" />
      <EditOrder />
    </>
  );
};

export default EditOrderPage;
