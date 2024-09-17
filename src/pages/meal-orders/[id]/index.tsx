import EditMealOrder from '@/views/edit-meal-order';
import { NextSeo } from 'next-seo';

const EditMealOrderPage = () => {
  return (
    <>
      <NextSeo title="Edit meal order" />
      <EditMealOrder />
    </>
  );
};

export default EditMealOrderPage;
